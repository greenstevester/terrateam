# Terrateam Behavioral Changes Report

**Period**: January 2025 — February 2026
**Generated**: 2026-02-19
**Scope**: All changes affecting user-visible behavior since early January 2025
**Evidence**: 1,407 commits across 428 merged PRs on `main`

---

## Executive Summary

If you noticed Terrateam behaving differently since early January 2026, the primary cause is **PR #978 — the "New-Age" Evaluator rewrite**. This 6.5-month effort replaced the monolithic event evaluator with a dependency-graph-based architecture. It was first deployed January 5, 2026, suffered 6 rollback cycles over 21 days, and became the stable default on January 26, 2026.

Alongside the evaluator rewrite, significant database performance work landed: PostgreSQL binary wire protocol (#1123), bulk work manifest loading (#1130), and connection pool fairness fixes (#1084). These were directly motivated by issues the new evaluator exposed under load.

---

## Table of Contents

1. [The #978 Evaluator Rewrite](#1-the-978-evaluator-rewrite)
2. [Database & Performance Improvements](#2-database--performance-improvements)
3. [Bug Fixes Affecting Behavior](#3-bug-fixes-affecting-behavior)
4. [New Features](#4-new-features)
5. [Complete Timeline](#5-complete-timeline)
6. [Evidence & Commit References](#6-evidence--commit-references)

---

## 1. The #978 Evaluator Rewrite

### What Changed

The core engine that processes all VCS events (pull request comments, pushes, webhooks) was completely rewritten.

**Old Architecture — Monolithic Evaluator:**
```
┌──────────────────────────────────────────────┐
│  terrat_vcs_event_evaluator.ml (8,156 lines) │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ PR Event │  │  Push    │  │  Drift   │   │
│  │ Handler  │  │ Handler  │  │ Handler  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │         │
│       └──────────────┼──────────────┘         │
│                      ▼                        │
│              Single DB Connection             │
│              (held for entire op)             │
│                      │                        │
│                      ▼                        │
│              Sequential Execution             │
│              (one task at a time)             │
└──────────────────────────────────────────────┘
```

**New Architecture — Dependency-Graph Evaluator:**
```
┌─────────────────────────────────────────────────────────────────┐
│  terrat_vcs_event_evaluator2/ (~357,000 lines across 12 files) │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Buildsys (Build Systems a la Carte)                │        │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │        │
│  │  │  Key A  │──│  Key B  │──│  Key C  │  Hmap keys  │        │
│  │  └────┬────┘  └────┬────┘  └────┬────┘             │        │
│  │       │             │             │                  │        │
│  │       ▼             ▼             ▼                  │        │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │        │
│  │  │ Task A  │  │ Task B  │  │ Task C  │  Typed tasks │        │
│  │  └─────────┘  └─────────┘  └─────────┘             │        │
│  └─────────────────────┬───────────────────────────────┘        │
│                        │                                        │
│  ┌─────────────────────▼───────────────────────────────┐        │
│  │  Abb_bounded_suspendable_executor (20 slots)        │        │
│  │                                                     │        │
│  │  ┌────┐┌────┐┌────┐┌────┐        ┌──────────────┐  │        │
│  │  │ T1 ││ T2 ││ T3 ││ T4 │  ...   │ Suspend Queue│  │        │
│  │  └────┘└────┘└────┘└────┘        └──────────────┘  │        │
│  │       ↕              ↕                              │        │
│  │  Suspend/Resume on I/O blocking                     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  State Machines                                     │        │
│  │  wm_sm_tf_op ─── wm_sm_indexer ─── wm_sm_repo_tree │        │
│  │  wm_sm_build_config ─── access_control              │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  Per-transaction DB connections (get → use → release)           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Differences

| Aspect | Old Evaluator | New Evaluator |
|--------|--------------|---------------|
| **File** | Single 8,156-line file | 12 files, ~357K lines total |
| **Execution** | Sequential, one task at a time | Dependency graph, parallel tasks |
| **Concurrency** | Unbounded (up to 50 slots) | Bounded (20 slots) with suspend/resume |
| **DB Connections** | Held for entire operation | Per-transaction acquire/release |
| **Task Model** | Direct function calls | Buildsys typed task graph with Hmap |
| **State** | Implicit in control flow | Explicit state machines (5 SMs) |
| **Error Recovery** | Basic try/catch | Structured error types + abort handling |

### The Buildsys Module

Inspired by the paper "Build Systems a la Carte" (Mokhov et al., 2018), the `buildsys` module provides:

```
┌───────────────────────────────────────────┐
│  Buildsys.T (Build Orchestration)         │
│                                           │
│  Tasks ──► Fetcher ──► Rebuilder          │
│    │          │            │               │
│    ▼          ▼            ▼               │
│  Key→Task  Resolve     Rerun logic        │
│  lookup    dependencies for invalidated   │
│            from State   keys              │
│                                           │
│  State: Hmap (heterogeneous typed map)    │
│  Key: type ('a) key encoding result type  │
│  Task: key list → state → fetcher → 'a   │
└───────────────────────────────────────────┘
```

The key innovation is **type-safe heterogeneous maps** (Hmap). Each key encodes both its identity and its result type at the OCaml type level, providing compile-time guarantees about task dependencies.

### The Bounded Suspendable Executor

```
┌─────────────────────────────────────────────┐
│  Abb_bounded_suspendable_executor           │
│                                             │
│  Capacity: 20 concurrent slots              │
│                                             │
│  ┌──────────┐   ┌──────────┐               │
│  │ Running  │◄──│ Waiting  │  (queue)      │
│  │  Tasks   │   │  Tasks   │               │
│  └────┬─────┘   └──────────┘               │
│       │                                     │
│       ▼ (I/O blocking)                      │
│  ┌──────────┐                               │
│  │Suspended │  Releases slot temporarily    │
│  │  Tasks   │  Other tasks can use it       │
│  └────┬─────┘                               │
│       │ (I/O complete)                      │
│       ▼                                     │
│  Re-acquire slot, continue execution        │
│                                             │
│  Metrics: queue_time, running, suspended    │
└─────────────────────────────────────────────┘
```

### Deployment Timeline — The Turbulent Rollout

```
Jan 5    Jan 5    Jan 9    Jan 12   Jan 12   Jan 13   Jan 14     Jan 26
  │        │        │        │        │        │        │           │
  ▼        ▼        ▼        ▼        ▼        ▼        ▼           ▼
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐       ┌────────┐
│ D1 │  │ R1 │  │ R2 │  │ R3 │  │ D2 │  │ R4 │  │ D3 │  ...  │DEFAULT │
│DEPL│  │RVRT│  │RVRT│  │RVRT│  │DEPL│  │RVRT│  │DEPL│       │STABLE  │
└────┘  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘       └────────┘
  │        │        │        │        │        │        │           │
  │  DB    │  Dead- │  Pool  │  Bring │  Fix   │  Fix   │   Make   │
  │  stomp │  lock  │  fair- │  back  │  rvrt  │  rvrt  │  new-age │
  │  issue │  found │  ness  │  new   │  chain │  chain │  default │
```

**Detailed revert sequence:**

| Date | SHA | Action | Issue |
|------|-----|--------|-------|
| Jan 5 15:50 | `9abbb077` | **Deploy** PR #1066 merged | First production deployment |
| Jan 5 19:03 | `99837881` | **Revert** legacy removal | DB connection stomping |
| Jan 5 19:03 | `4fa48133` | **Revert** base image | Cascading failure |
| Jan 5 19:04 | `205c63af` | **Revert** new evaluator | Full rollback |
| Jan 5 19:18 | `f227d0fb` | Merge PR #1069 | Revert release |
| Jan 5 21:00 | `bb84d584` | **Re-deploy** new evaluator | NYI fix + DB exception handling |
| Jan 9 12:01 | `88974929` | **Revert** PR #1078 | Rollback part 2 |
| Jan 12 14:39 | `8bdde678` | **Revert** new evaluator | Rollback part 3 |
| Jan 12 16:16 | `720e5498` | **Re-deploy** with fixes | Pool deadlock fix |
| Jan 13 20:02 | `c5837258` | **Revert** new evaluator | Fix revert chain |
| Jan 14 08:50 | `e8501c75` | **Re-deploy** | Revert of revert of revert |
| Jan 26 | `ff62f374` | **Made default** PR #1112 | Stable — new-age is now default |

**Root causes of instability:**
1. **DB connection stomping** (`e2e678fb`): New evaluator held connections across multiple transactions
2. **Pool deadlocks** (`4f7a6063`): Concurrent pool access caused deadlocks under load
3. **Exception handling** (`28bf0f4c`): DB errors + OCaml exceptions not handled together correctly
4. **Legacy work manifest routing**: New evaluator needed to handle work manifests created by old evaluator
5. **Mode checking conflicts** (`c9aab07d`, `51d39d70`): Drift mode checks conflicting with new execution model

### User-Visible Behavioral Changes

| Behavior | Before (Old Evaluator) | After (New Evaluator) |
|----------|----------------------|----------------------|
| **Concurrent operations** | Sequential within an installation | Up to 20 parallel tasks with suspend/resume |
| **DB connection usage** | One connection held for entire operation | Per-transaction, released between ops |
| **Operation ordering** | FIFO within installation | Dependency-graph ordered (tasks run when deps satisfied) |
| **Error messages** | Generic errors | Structured error types with context |
| **Drift scheduling** | Inferred from work manifests | Explicit `last_tried_at` DB column |
| **Status checks** | Always created | Skipped for disabled repos |
| **Large runs** | Slower (sequential queries) | Faster (bulk loading, parallel execution) |

---

## 2. Database & Performance Improvements

### PR #1123 — PostgreSQL Binary Wire Protocol

**Merged**: Feb 11, 2026 (`3d4e3fec`)
**Implementation**: `67a7682b`, `587c6cc6`
**Scope**: 25 files, +2,170 / -549 lines

Switched parameter encoding from text to binary format for PostgreSQL queries.

```
┌─────────────────────────────────────────────────────┐
│  Before: Text Protocol                              │
│                                                     │
│  OCaml int32  ──► string "42"  ──► PostgreSQL       │
│  OCaml bool   ──► string "t"   ──► PostgreSQL       │
│  OCaml UUID   ──► string "abc.."──► PostgreSQL      │
│                                                     │
│  Each value: allocate string → format → parse       │
├─────────────────────────────────────────────────────┤
│  After: Binary Protocol                             │
│                                                     │
│  OCaml int32  ──► 4 bytes BE  ──► PostgreSQL        │
│  OCaml bool   ──► 1 byte     ──► PostgreSQL         │
│  OCaml UUID   ──► 16 bytes   ──► PostgreSQL         │
│                                                     │
│  Each value: direct memory copy, no parsing         │
└─────────────────────────────────────────────────────┘
```

**New binary encoders added to `pgsql_codec`:**

```ocaml
module Binary_value.Encode = struct
  val int2   : int -> string      (* 2-byte big-endian *)
  val int4   : int32 -> string    (* 4-byte big-endian *)
  val int8   : int64 -> string    (* 8-byte big-endian *)
  val float4 : float -> string    (* IEEE 754 single *)
  val float8 : float -> string    (* IEEE 754 double *)
  val bool   : bool -> string     (* 1-byte *)
end
```

**Types migrated to binary**: `smallint`, `integer`, `bigint`, `real`, `double`, `boolean`, `uuid`, `json`, `money`

**Call sites updated**: 19 modules including both GitHub and GitLab providers, session management, KV store, tag query compilation, and access token handling.

**Impact**: 2-3x faster encode/decode for numeric types. Particularly benefits queries with many WHERE clauses and large JSON payloads.

### PR #1130 — Bulk Work Manifest Loading

**Merged**: Feb 11, 2026 (`e8f68e47`)
**Implementation**: `8b82c913`, `94c306c6`
**Scope**: 20 files, +731 / -404 lines

Replaced N+1 individual queries with batch queries using PostgreSQL `ANY()`.

```
┌──────────────────────────────────────┐
│  Before: N+1 Query Pattern           │
│                                      │
│  for each work_manifest_id:          │
│    SELECT * FROM work_manifests      │
│    WHERE id = $1;                    │
│                                      │
│  100 manifests = 100 round-trips     │
│  Latency: O(n) × network RTT        │
├──────────────────────────────────────┤
│  After: Batch Query Pattern          │
│                                      │
│  SELECT * FROM work_manifests        │
│  WHERE id = ANY($ids);              │
│                                      │
│  100 manifests = 1 round-trip        │
│  Latency: O(1) × network RTT        │
└──────────────────────────────────────┘
```

**12 new batch SQL queries created** (6 each for GitHub and GitLab):
- `select_work_manifests_batch.sql`
- `select_drift_work_manifests_batch.sql`
- `select_work_manifest_dirspaceflows_batch.sql`
- `select_work_manifest_pull_requests_batch.sql`
- `select_work_manifest_access_control_denied_dirspaces_batch.sql`

Also added **higher-fidelity PostgreSQL error types** (`94c306c6`):

```ocaml
type err = [
  | `Unique_violation_err of integrity_err   (* 23505, 23P01 *)
  | `Foreign_key_err of integrity_err        (* 23503, 23001 *)
  | `Integrity_err of integrity_err          (* 23000, 23502, 23514, 40002 *)
  | `Deadlock_detected of pgsql_err          (* 40001, 40P01 *)
  | `Lock_timeout of pgsql_err               (* 55P03 *)
  | `Statement_timeout                       (* 57014 *)
  | `Syntax_err of pgsql_err                 (* 42xxx *)
  | `Pgsql_err of pgsql_err                  (* everything else *)
]
```

### PR #1084 — Connection Pool Fairness

**Merged**: Jan 9, 2026 (`045ff99d`)
**Scope**: 1 file, +375 / -158 lines (`terrat_vcs_event_evaluator2.ml`)

```
┌──────────────────────────────────────┐
│  Before: Connection Hoarding         │
│                                      │
│  with_conn ~f:(fun db ->             │
│    tx1 db  (* holds connection *)    │
│    >>= fun () ->                     │
│    tx2 db  (* still holds it *)      │
│    >>= fun () ->                     │
│    tx3 db  (* still holds it *)      │
│  )                                   │
│                                      │
│  Other requests WAIT for all 3 txns  │
├──────────────────────────────────────┤
│  After: Per-Transaction Release      │
│                                      │
│  with_conn ~f:(fun db -> tx1 db)     │
│  >>= fun () ->                       │
│  with_conn ~f:(fun db -> tx2 db)     │
│  >>= fun () ->                       │
│  with_conn ~f:(fun db -> tx3 db)     │
│                                      │
│  Connection released between txns    │
│  Other requests can interleave       │
└──────────────────────────────────────┘
```

**Impact**: Dramatically reduces tail latency under concurrent load. Previously, a long-running operation with 3 transactions would block the pool for the entire duration. Now each transaction independently acquires and releases.

### PR #1085 — Query Performance Fix

**Merged**: Jan 9, 2026 (`1e8b6fd3`)
**Scope**: 2 files, +2 / -2 lines

Added missing `context_id` filter to `select_dirspace_applies_for_context.sql`:

```sql
-- Before: scans ALL merged PRs (missing filter)
WHERE gpr.state = 'merged'
ORDER BY gpr.merged_at DESC LIMIT 1

-- After: scans only PRs for this context (indexed)
WHERE jc.id = $context_id AND gpr.state = 'merged'
ORDER BY gpr.merged_at DESC LIMIT 1
```

**Impact**: Query drops from O(n) full table scan to O(log n) indexed lookup. In large installations, this can be 20-100x faster.

---

## 3. Bug Fixes Affecting Behavior

### PR Base Branch Handling (#1118, #1121)

**Dates**: Jan 29-30, 2026
**SHAs**: `0c2a6d3b`, `3fee880a`

```
┌──────────────────────────────────────┐
│  Before:                             │
│                                      │
│  PR base_ref ──► cached value        │
│  (could be stale if base changed)    │
│                                      │
│  Result: operations against wrong    │
│  base branch, incorrect diffs        │
├──────────────────────────────────────┤
│  After:                              │
│                                      │
│  PR base_ref ──► fetch_branch_sha()  │
│  (always fetches current value)      │
│                                      │
│  Result: correct base branch,        │
│  accurate diffs even after retarget  │
└──────────────────────────────────────┘
```

### Drift Detection Overhaul (#719, #1106, #1113, #1116)

**Dates**: Jan 22-28, 2026
**Key SHAs**: `89cb717f`, `819a95a4`, `661df845`

```
┌──────────────────────────────────────┐
│  Before:                             │
│                                      │
│  "When did drift last run?"          │
│       │                              │
│       ▼                              │
│  Scan work_manifests table           │
│  for type=drift, find latest         │
│       │                              │
│  Problems:                           │
│  • Expensive query on large tables   │
│  • Race condition: duplicate drifts  │
│  • Missing repos caused crashes      │
├──────────────────────────────────────┤
│  After:                              │
│                                      │
│  "When did drift last run?"          │
│       │                              │
│       ▼                              │
│  Read last_tried_at column           │
│  (dedicated, indexed)                │
│       │                              │
│  SELECT ... FOR UPDATE SKIP LOCKED   │
│  (prevents duplicate scheduling)     │
│       │                              │
│  Skip repos that fail to load        │
│  (graceful degradation)              │
└──────────────────────────────────────┘
```

### Status Check Fixes (#1108, #1109)

**Dates**: Jan 23-25, 2026
**SHAs**: `f640c343`, `0570ea86`

- **Hanging status checks**: Checks stuck in "pending" now marked complete
- **Disabled repos**: No longer create status checks for disabled repositories

### YAML Anchor Merge Fix (#1029, #1030)

**Date**: Dec 2, 2025
**SHA**: `046bc3d8`

YAML anchor merging (using `<<: *anchor`) was broken in `.terrateam/config.yml` parsing. Configs using YAML anchors for DRY workflow definitions would silently produce incorrect merged configurations.

### VCS Comment Query Fix (#975, #983)

**Date**: Nov 13, 2025
**SHA**: `489e325a`

Comment-based queries (used for `terrateam plan`, `terrateam apply` commands in PRs) were not matching correctly, causing some commands to be missed or misrouted.

### Config Error Reporting (#597)

**SHA**: `84ac2b61`

```
Before: Silent failure — invalid .terrateam/config.yml
         would be ignored, defaults used silently

After:  Early error message posted to PR explaining
        what's wrong with the configuration
```

---

## 4. New Features

### KV Store System (#889, #907, #916, #1018)

**Dates**: Oct 11 — Nov 24, 2025
**Key SHAs**: `c8189e43`, `ddda8f97`, `ef40b1cf`, `3e5d2038`

New persistent key-value store with namespaced keys and row-level access control. Integrated into VCS HTTP interface for workflow data persistence between operations.

### Terragrunt Config Builder (#1020, #1021)

**Date**: Dec 5, 2025
**SHA**: `c2f64f89`

Auto-discovers `terragrunt.hcl` files and generates dependency graphs. Eliminates manual directory configuration for Terragrunt monorepos.

### Colored Plan Diff in Iris UI (#987, #988)

**Date**: Nov 14, 2025
**SHA**: `4e7c6756`

Plan outputs now show colored diff highlighting in the web UI, using backend-generated plan diffs for accurate rendering.

### Enhanced Stacks UI (#892, #957, #989, #1013, #1051, #1052)

**Dates**: Nov 3, 2025 — Jan 7, 2026
**Key SHAs**: `cb66cc1b`, `31c590d1`, `fe321494`, `68ee27ad`

- Dedicated Stacks screen in Iris
- Expandable PR views within stacks
- Fixed duplicate entries in large stacks
- Performance optimizations for stack rendering

### Standard Library — SLN (#1119, #1120)

**Date**: Feb 2, 2026
**SHA**: `70b3f70a`

New internal standard library ("Some Library Name") with `Sln_set` and `Sln_map` data structures.

### GitLab Integration Improvements (#999, #1006, #1061)

**Dates**: Dec 21-23, 2025
**Key SHAs**: `abebf36e`, `62a9048f`, `bc7c08dc`

- Lower admin permission requirements for GitLab installations
- GitLab template support fixes
- GitLab inputs integration

### Settings API (#995)

**Date**: Nov 14, 2025
**SHA**: `d0a1de86`

New settings API endpoint for managing installation-level configuration.

### DB Port Customization (#1134)

**Date**: Feb 11, 2026
**SHA**: `d2feeee3`

PostgreSQL connection port is now configurable, supporting non-standard database setups.

### GitHub Actions Dynamic Title (#1067)

**Date**: Jan 27, 2026
**SHA**: `9fdea7cd`

GitHub Actions workflow runs now show dynamic titles reflecting the operation type and scope.

---

## 5. Complete Timeline

```
2025
────────────────────────────────────────────────────────────
Oct 11   KV Store Phase 1 & 2 (#889)
Oct 16   Remove boxing on logging (#978 prep)
Oct 17   Add 'all' functions to Future combinators
Nov 3    Stacks UI: fix large stacks duplicates (#962)
Nov 4    Iris Stacks screen (#957)
Nov 5    KV Store final merge (#916)
Nov 10   Include SQL statement in busy SQL exception
Nov 13   VCS comment query fix (#983)
Nov 13   Stacks screen improvements (#989)
Nov 14   Colored plan diff in Iris (#988)
Nov 14   Settings API (#995)
Nov 15   Make work manifests showable (#978 prep)
Nov 20   Increase logging dimensions
Nov 24   KV Store system design docs (#1018)
Nov 24   Stacks view optimizations (#1013)
Dec 2    YAML anchor merge fix (#1030)
Dec 5    Terragrunt config builder (#1021)
Dec 15   Run kind data in apply (#1050)
Dec 15   Fix workflow dispatch (#1049)
Dec 21   GitLab templates fix (#1006)
Dec 22   GitLab inputs (#999)
Dec 23   Lower GitLab admin requirements (#1061)

2026
────────────────────────────────────────────────────────────
Jan 1    RFD: flavours of plan and apply (#978)
Jan 5    ████ EVALUATOR v2 DEPLOYED (#1066) ████
Jan 5    ▓▓▓▓ REVERTED — DB connection stomping ▓▓▓▓
Jan 5    Re-deployed with DB+exception fixes
Jan 7    Enhanced Stacks UI (#1051, #1052)
Jan 7    js-yaml 4.1.1 update
Jan 8    Plan downgrade warning in Iris (#1080)
Jan 8    Slack link in Iris (#1082)
Jan 9    ▓▓▓▓ REVERTED — Rollback part 2 (#1078) ▓▓▓▓
Jan 9    Connection pool fairness fix (#1084)
Jan 9    Query performance fix (#1085)
Jan 10   Bring back new evaluator
Jan 11   Thread size control to abb
Jan 12   ▓▓▓▓ REVERTED — Rollback part 3 (#1091) ▓▓▓▓
Jan 12   Pool deadlock fix, re-deployed (#1089)
Jan 13   ▓▓▓▓ REVERTED — Fix revert chain (#1093) ▓▓▓▓
Jan 14   Re-deployed (revert of revert of revert)
Jan 15   Drift mode check fixes (#1097)
Jan 22   Track drift schedule in DB (#1106)
Jan 22   Job query fix (#1105)
Jan 23   Fix hanging status checks (#1108)
Jan 25   Disabled repos status checks (#1109)
Jan 26   ████ EVALUATOR v2 MADE DEFAULT (#1112) ████
Jan 27   Fix duplicate drifts (#1113)
Jan 27   GitHub Actions dynamic title (#1067)
Jan 28   Drift pagination analytics (#1116)
Jan 29   PR base branch handling fix (#1118)
Jan 30   PR base changing fix (#1121)
Feb 2    PostgreSQL binary wire protocol (#1123)
Feb 2    Standard library SLN (#1120)
Feb 6    Stripe pricing table (#1127)
Feb 11   Bulk load work manifests (#1130)
Feb 11   Higher fidelity pgsql errors (#1130)
Feb 11   PostgreSQL binary format merge (#1133)
Feb 11   DB port customization (#1134)
Feb 11   Fix slow performance in big runs (#1135)
```

---

## 6. Evidence & Commit References

### #978 Evaluator Rewrite — Key Commits

| SHA | Date | Description |
|-----|------|-------------|
| `775c501c` | 2025-07-20 | Build system foundation |
| `aa7b0ecd` | 2025-07-20 | Move to buildsys-based evaluator |
| `9ae216f4` | 2025-07-24 | Fix protect_finally exception handling |
| `961046b8` | 2026-01-01 | RFD: flavours of plan and apply |
| `02fdd75e` | 2026-01-05 | Connection ID to pgsql client |
| `a4009dbe` | 2026-01-05 | Builder tables, branch to work manifest |
| `c0b8cd35` | 2026-01-05 | Remove legacy evaluator |
| `e2e678fb` | 2026-01-05 | Database stomping fix |
| `9abbb077` | 2026-01-05 | Merge PR #1066 (first deployment) |
| `28bf0f4c` | 2026-01-05 | Handle DB + exception correctly |
| `4f7a6063` | 2026-01-12 | Fix deadlock in pool connection |
| `559e56bc` | 2026-01-11 | Thread size control to abb |
| `2ad66564` | 2026-01-12 | Merge PR #1089 (bring back new evaluator) |
| `7f289264` | 2026-01-26 | Make new-age the default |
| `ff62f374` | 2026-01-26 | Merge PR #1112 (default) |

### Database & Performance — Key Commits

| SHA | Date | Description |
|-----|------|-------------|
| `045ff99d` | 2026-01-09 | Connection pool fairness (#1084) |
| `1e8b6fd3` | 2026-01-09 | Query performance fix (#1085) |
| `67a7682b` | 2026-02-02 | Switch to pgsql binary wire protocol |
| `587c6cc6` | 2026-02-02 | All call points use binary API |
| `94c306c6` | 2026-02-11 | Higher fidelity errors to pgsql |
| `8b82c913` | 2026-02-11 | Bulk load work manifests |
| `3d4e3fec` | 2026-02-11 | Merge PR #1133 (binary format) |
| `e8f68e47` | 2026-02-11 | Merge PR #1135 (bulk loading) |

### Bug Fixes — Key Commits

| SHA | Date | Description |
|-----|------|-------------|
| `489e325a` | 2025-11-13 | VCS comment query fix |
| `046bc3d8` | 2025-12-02 | YAML anchor merge fix |
| `84ac2b61` | various | Config error reporting (#597) |
| `f640c343` | 2026-01-23 | Fix hanging status checks |
| `0570ea86` | 2026-01-25 | Disabled repos status checks |
| `89cb717f` | 2026-01-22 | Track drift schedule in DB |
| `819a95a4` | 2026-01-27 | Fix duplicate drifts |
| `0c2a6d3b` | 2026-01-29 | PR base branch handling |
| `3fee880a` | 2026-01-30 | PR base changing fix |

### New File Structure (Evaluator v2)

```
code/src/terrat_vcs_event_evaluator2/
├── terrat_vcs_event_evaluator2.ml              (~39,360 lines)
├── terrat_vcs_event_evaluator2.mli
├── terrat_vcs_event_evaluator2_builder.ml       (~7,275 lines)
├── terrat_vcs_event_evaluator2_tasks.ml        (~141,581 lines)
├── terrat_vcs_event_evaluator2_tasks_pr.ml      (~64,689 lines)
├── terrat_vcs_event_evaluator2_tasks_branch.ml  (~12,327 lines)
├── terrat_vcs_event_evaluator2_access_control.ml (~8,076 lines)
├── terrat_vcs_event_evaluator2_wm_sm.ml         (~13,439 lines)
├── terrat_vcs_event_evaluator2_wm_sm_tf_op.ml   (~35,096 lines)
├── terrat_vcs_event_evaluator2_wm_sm_indexer.ml  (~11,057 lines)
├── terrat_vcs_event_evaluator2_wm_sm_repo_tree.ml (~11,079 lines)
└── terrat_vcs_event_evaluator2_wm_sm_build_config.ml (~12,340 lines)

code/src/buildsys/
├── buildsys.ml
└── buildsys.mli

code/src/abb_bounded_suspendable_executor/
├── abb_bounded_suspendable_executor.ml  (236 lines)
└── abb_bounded_suspendable_executor.mli
```

### Statistics

- **Total commits since Jan 2025**: 1,407
- **Merged PRs**: 428
- **#978 commits total**: 112 (97 since Nov 2025)
- **#978 revert/rollback commits**: 9 (Jan 5-14, 2026)
- **#978 development span**: 6.5 months (Jul 20, 2025 — Jan 26, 2026)
- **Old evaluator**: 8,156 lines in 1 file
- **New evaluator**: ~357,000 lines across 12 files
- **Performance PRs**: 4 major (#1084, #1085, #1123, #1130)

---

*Report generated from git history analysis of the Terrateam repository. All commit SHAs verified against `main` branch.*
