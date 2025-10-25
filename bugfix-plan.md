# Terrateam Customer-Avaloq Issues: Strategic Bugfix Plan

**Repository**: https://github.com/terrateamio/customer-avaloq/issues
**Plan Created**: September 3, 2025
**Last Updated**: October 25, 2025
**Original Issues**: 29 issues in plan
**Current Open Issues**: 29 (3 closed, 3 new since plan creation)
**Strategy**: Simplest first, building momentum toward complex features
**Status**: 7 weeks into execution, Phase 2-3 transition

---

## 📊 **Executive Summary**

This plan prioritizes 29 open issues in the customer-avaloq repository, organizing them into 4 phases from simplest to most complex. The strategy focuses on quick wins to build development momentum while establishing patterns for tackling larger architectural challenges.

**Key Metrics:**
- **Phase 1-2**: 8 issues resolved in first month (quick wins)
- **Phase 3-4**: 15+ issues resolved by end of quarter
- **Immediate Start**: Issue #56 (action type environment variable)

**Current Status (Week 7):**
- 169 commits since plan inception
- Major architecture documentation completed
- Issue #56 implemented but pending merge
- 3 issues closed: #32 (Docker non-root server), #69 (CODEOWNERS), #70 (Config builder)
- 3 new issues: #73 (Metrics docs), #76 (Force layer recalc), #77 (Repo trees hash mismatch)
- Focus needed: merge pending work and continue Phase 2-3 execution

---

## 🔄 **Progress Update (October 25, 2025)**

### **Completed Work**

#### **Issue #56: TERRATEAM_ACTION_TYPE Environment Variable** ✅
- **Status**: Implemented on branch `fix/issue-56-action-type-env-var`
- **Commits**:
  - `cb30c83b` - Implementation (Sept 4, 2025)
  - `2a11b9e2` - Documentation (Sept 6, 2025)
- **Action Required**: Merge to main branch and deploy

#### **Architecture Documentation** ✅
- Comprehensive architecture documentation suite completed
- Files created: `ARCHITECTURE.md`, `FRONTEND-ARCHITECTURE.md`, `SUMMARY.md`
- Commits: `82b79ff8`, `24ac44c8`, `13fb6fc6`

#### **Recent Bug Fixes & Improvements**
- **#899**: GitLab token setup refactor
- **#937**: GitHub token expiration fix
- **#901**: Checkov/Conftest version setting
- **#795**: Documentation reorganization
- **#920**: Tenv cache failure fix
- **#913**: Libkqueue visor fix

#### **Issue Backlog Changes**

**Closed Issues (3):**
- **#32**: Set Docker USER to non-root (server) ✅
- **#69**: CODEOWNERS like support ✅
- **#70**: Config builder enhancements (apply_requirements, access_control, destination_branches) ✅

**New Issues (3):**
- **#73**: Create metrics documentation
- **#76**: Support forcing layer recalculation independent of hash
- **#77**: Missing repo_trees entries when base SHA changes (hash mismatch)

**Net Change**: 29 issues remain (same as original plan count)

### **Analysis**

**Timeline Assessment:**
- **Week 7 of execution** (originally planned for Week 5-8 Phase 3)
- **169 commits** in 7 weeks (~24 commits/week average)
- Development velocity is strong with parallel workstreams

**Observations:**
1. Issue #56 completed as planned but not merged to production
2. Significant infrastructure and documentation work completed
3. Multiple bug fixes addressed outside original plan scope
4. Team is maintaining steady development momentum

**Recommended Actions:**
1. **Immediate**: Merge Issue #56 to main and validate in production
2. **This Week**: Review and update issue tracking for customer-avaloq repository
3. **Next Week**: Resume Phase 2 execution (Issues #53, #64, #28)
4. **Month End**: Target Phase 2 completion with 4-6 more issues resolved

---

## 🎯 **Complete Issue Inventory**

### **All 29 Open Issues (By Complexity)**

| # | Title | Type | Complexity | Priority |
|---|-------|------|------------|----------|
| 56 | Create env var for action type | Feature | ⭐ Simple | 1 |
| 53 | Terrateam Workflow dynamic title | Improvement | ⭐ Simple | 2 |
| 64 | Display approval requirements and approvers | None | ⭐ Simple | 3 |
| 28 | Approval during plan operation | Improvement | ⭐ Simple | 4 |
| 73 | Create metrics documentation | None | ⭐⭐ Medium | 5 |
| 61 | Support markdown in PR output for OPA | None | ⭐⭐ Medium | 6 |
| 24 | Investigate lock message on plan completion | Improvement | ⭐⭐ Medium | 7 |
| 60 | Provide parameters in `dir` for workflows | None | ⭐⭐ Medium | 8 |
| 26 | GitHub Actions Debug Logging | Feature | ⭐⭐ Medium | 9 |
| 66 | API endpoint to detect PRs with partial applies | None | ⭐⭐⭐ High | 10 |
| 16 | Report for PRs applied but not merged | Feature | ⭐⭐⭐ High | 11 |
| 62 | Directory must exist on plan | None | ⭐⭐⭐ High | 12 |
| 5 | Workflow fails without notifying user | Bug | ⭐⭐⭐ High | 13 |
| 76 | Force layer recalculation independent of hash | None | ⭐⭐⭐⭐ Very High | 14 |
| 77 | Missing repo_trees entries (hash mismatch) | None | ⭐⭐⭐⭐ Very High | 15 |
| 71 | Selective filtering for plan output | None | ⭐⭐⭐⭐ Very High | 16 |
| 65 | Add output hashing to skip deployments | None | ⭐⭐⭐⭐ Very High | 17 |
| 72 | GitHub Actions log cleanup | None | ⭐⭐⭐⭐ Very High | 18 |
| 39 | PostgreSQL v15 upgrade | Improvement | ⭐⭐⭐⭐⭐ Critical | 19 |
| 46 | Set Docker USER to non-root (action) | Improvement | ⭐⭐⭐⭐⭐ Critical | 20 |
| 35 | Deprecate unsafe self-signed certs | Improvement | ⭐⭐⭐⭐⭐ Critical | 21 |
| 25 | Large container image optimizations | Improvement | ⭐⭐⭐⭐⭐ Critical | 22 |
| 31 | Support errored.tfstate management | Feature | ⭐⭐⭐⭐⭐ Critical | 23 |
| 23 | Require review of manual state changes | Feature | ⭐⭐⭐⭐⭐ Critical | 24 |
| 1 | GitHub workflow file update handling | Issue | ⭐⭐⭐⭐⭐ Critical | 25 |
| 68 | Terraform Destroy | None | ⭐⭐⭐⭐⭐⭐ Epic | 26 |
| 36 | OpenTofu State Encryption + Vault | Question | ⭐⭐⭐⭐⭐⭐ Epic | 27 |
| 49 | GitHub Action smoke test framework | Improvement | ⭐⭐⭐⭐⭐⭐ Epic | 28 |
| 38 | Disaster Recovery review | Training | ⭐⭐⭐⭐⭐⭐ Epic | 29 |

**Closed Since Plan Creation:**
- ~~#32: Set Docker USER to non-root (server)~~ ✅ **CLOSED**
- ~~#69: CODEOWNERS like support~~ ✅ **CLOSED**
- ~~#70: Config builder enhancements~~ ✅ **CLOSED**

---

## 🚀 **4-Phase Implementation Strategy**

### **🟢 Phase 1: Quick Wins (Weeks 1-2)**

**Goal**: Build momentum with simple, high-impact fixes

#### **Issue #56: Create env var for action type** ⭐ **COMPLETED - PENDING MERGE**
**Timeline**: 1-2 days ✅ **DONE (Sept 4-6, 2025)**
**Impact**: High (enables workflow conditional logic)
**Complexity**: Very Low
**Status**: ⚠️ Implemented on branch `fix/issue-56-action-type-env-var`, needs merge to main

**Implementation Plan:**
```bash
# 1. Backend Changes (OCaml)
cd code/src/terrat_workflow_runner
# Add TERRATEAM_ACTION_TYPE environment variable
# Values: tree_builder, config_builder, plan, apply, index, drift

# 2. Testing
cd code && make test-release_terrat_workflow_runner

# 3. Documentation update
# Add workflow examples with conditional steps
```

**Expected Outcome:**
```yaml
# Users can now write conditional workflow steps
- name: Plan-specific step
  if: env.TERRATEAM_ACTION_TYPE == 'plan' 
  run: echo "This only runs during plans"
```

#### **Issue #53: Terrateam Workflow dynamic title**
**Timeline**: 2-3 days  
**Impact**: Medium (improves GitHub workflow visibility)  
**Complexity**: Low

**Implementation Plan:**
```bash
# 1. Add workflow_name field to config schema
cd code && make terrat-repo-config

# 2. Update GitHub Actions template
# name: Terrateam - ${{ github.ref_name }}

# 3. API Schema changes
make terrat-api && cd src/iris && npm run generate-api-types
```

#### **Issue #64: Display approval requirements and approvers**
**Timeline**: 3-4 days  
**Impact**: High (improves user experience)  
**Complexity**: Low-Medium

**Implementation Plan:**
```bash
# 1. API Enhancement - add approval info to work manifest
cd code && vim api_schemas/terrat/api.json

# 2. Frontend Updates - ApprovalRequirements component
cd code/src/iris/src/lib/components/business
# Create ApprovalRequirements.svelte

# 3. GitHub comment updates
# Modify PR comment templates
```

#### **Issue #28: Approval during plan operation**
**Timeline**: 1-2 days  
**Impact**: Medium (reduces user confusion)  
**Complexity**: Low

### **🟡 Phase 2: Enhancement Features (Weeks 3-4)**

#### **Issue #61: Support markdown in PR output for OPA**
**Timeline**: 2-3 days  
**Impact**: High (improves policy output readability)

#### **Issue #24: Lock message on plan completion**
**Timeline**: 1-2 days
**Impact**: Medium (informational improvement)

#### **Issue #60: Directory parameters in workflows**
**Timeline**: 3-4 days
**Impact**: High (enables advanced workflow patterns)

#### **Issue #26: GitHub Actions Debug Logging**
**Timeline**: 2-3 days
**Impact**: Medium (improves debugging experience)

#### **Issue #73: Create metrics documentation**
**Timeline**: 2-3 days
**Impact**: Medium (improves observability and monitoring)
**Note**: New issue added to backlog

**Phase 2 Deliverables:**
- 9 issues resolved in first month (updated from 8)
- Improved user experience across core workflows
- Established development rhythm and testing patterns
- Enhanced documentation for metrics and monitoring

### **🟠 Phase 3: Backend Logic & APIs (Weeks 5-8)**

#### **Issue #66: API endpoint for partial applies detection**
**Timeline**: 1-2 weeks  
**Impact**: High (prevents deployment inconsistencies)

**Implementation Plan:**
```bash
# 1. Database schema extension
# Add partial_apply_tracking table

# 2. API endpoint creation
cd code/src/terrat_api
# Add /api/v1/installations/{id}/partial-applies endpoint

# 3. Frontend integration
cd code/src/iris
# Create PartialAppliesReport component
```

#### **Issue #16: Report for applied but unmerged PRs**
**Timeline**: 1-2 weeks
**Impact**: High (operational visibility)

#### **Issue #62: Directory existence validation** 
**Timeline**: 3-5 days
**Impact**: Medium (prevents workflow failures)

#### **Issue #5: Workflow failure notifications**
**Timeline**: 1 week  
**Impact**: High (critical user feedback)

**Phase 3 Deliverables:**
- Advanced API endpoints with comprehensive reporting
- Improved error handling and user notifications  
- Foundation for complex operational features

### **🔴 Phase 4: Infrastructure & Security (Weeks 9-12)**

#### **Issue #39: PostgreSQL v15 upgrade**
**Timeline**: 2-3 weeks
**Impact**: Critical (security vulnerabilities)

**Implementation Plan:**
```bash
# 1. Database compatibility testing
cd docker/terrat
# Update docker-compose.yml postgres image

# 2. Migration script development
# Create database migration procedures

# 3. Rollback procedures
# Comprehensive disaster recovery plan
```

#### **Security Improvements** (#46, #35)
**Timeline**: 1-2 weeks each
**Impact**: Critical (production security)
**Note**: #32 (Docker non-root server) was completed ✅

#### **Performance Optimizations** (#25, #65, #71, #72, #76, #77)
**Timeline**: 2-4 weeks each
**Impact**: High (operational efficiency)
**Note**: #76 (force layer recalc) and #77 (repo_trees hash mismatch) added to backlog

---

## 🔧 **Development Workflows**

### **Quick Win Development Pattern**
```bash
# 1. Create feature branch
git checkout -b fix/issue-56-action-type-env-var

# 2. Backend changes
cd code
make terrat-schemas  # if schema changes needed
make debug-terrat    # compile changes

# 3. Frontend changes (if needed)
cd code/src/iris
npm run generate-api-types  # if API changes
npm run test                # validate changes

# 4. Testing
cd code
make test-release_terrat_workflow_runner

# 5. Documentation
# Update relevant CLAUDE.md files

# 6. Create PR with clear description
```

### **Testing Strategy by Phase**

#### **Phase 1-2: Focus on Functionality**
- Unit tests for new features
- Integration tests with existing workflows
- Manual testing with real GitHub repositories

#### **Phase 3-4: Comprehensive Testing**  
- Load testing for new APIs
- Database migration testing
- Security validation
- Performance benchmarking

---

## 📈 **Success Metrics & Milestones**

### **Week 2 Checkpoint** (September 2025)
- ⚠️ Issue #56 completed but not merged
- ✅ Development workflow established
- ✅ Team confidence building

### **Week 7 Checkpoint** (October 25, 2025) **← CURRENT**
- ✅ 169 commits demonstrating strong velocity
- ✅ Architecture documentation suite completed
- ⚠️ Issue #56 pending production deployment
- ⚠️ Issue #53 not yet started
- 🎯 **Status**: Behind schedule on Phase 1-2 customer-avaloq issues
- 🎯 **Cause**: Team focused on infrastructure, bug fixes, and documentation
- 🎯 **Remedy**: Refocus on customer-avaloq issue backlog

### **Month 2 Target** (Early November 2025)
- 🎯 Complete Phase 1-2 (8 issues total)
- 🎯 Issue #56 deployed and validated
- 🎯 Issues #53, #64, #28 completed
- 🎯 Begin Phase 2 enhancements

### **Month 3 Target** (December 2025)
- 🎯 12+ issues resolved (Phase 3 in progress)
- 🎯 Advanced API endpoints operational
- 🎯 Q4 retrospective completed

### **Quarter End Goal** (End of Q4 2025)
- 🎯 15+ issues resolved
- 🎯 Major infrastructure improvements complete
- 🎯 Phase 3 substantially complete
- 🎯 Q1 2026 roadmap defined

---

## ⚠️ **Risk Management**

### **Technical Risks**
- **Database migrations** (PostgreSQL upgrade) - Plan rollback procedures
- **Breaking changes** - Maintain backward compatibility
- **Performance impact** - Monitor system metrics during deployments

### **Project Risks**
- **Scope creep** - Stick to defined phases
- **Resource constraints** - Prioritize ruthlessly
- **User disruption** - Deploy during maintenance windows

### **Mitigation Strategies**
- Feature flags for major changes
- Comprehensive testing environments
- Regular stakeholder communication
- Clear rollback procedures for each phase

---

## 🎯 **Next Steps**

### **Immediate Actions (This Week - Week 7)**
1. **✅ Complete**: Review and merge Issue #56 branch to main
2. **Validate**: Test TERRATEAM_ACTION_TYPE in production environment
3. **Start Issue #53**: Dynamic workflow titles implementation
4. **Review**: Update customer-avaloq issue status and priorities

### **Week 8-9 Goals (Late October - Early November)**
1. Complete Issue #53 (dynamic workflow titles)
2. Begin Issue #64 (display approval requirements)
3. Start Issue #28 (approval during plan operation)
4. Document lessons learned from Issue #56 implementation

### **Week 10-12 Goals (Mid-Late November)**
1. Complete Phase 2 remaining issues (#61, #24, #60, #26)
2. Prepare for Phase 3 API and backend work
3. Conduct Phase 1-2 retrospective
4. Update strategic plan based on Q4 progress

### **Updated Communication Plan**
- **Weekly**: Progress review and issue prioritization
- **Bi-weekly**: Phase milestone reviews and blocker resolution
- **Monthly**: Stakeholder progress reports with metrics
- **Quarterly**: Strategic plan adjustments and Q1 2026 planning

---

## 📚 **Resources & References**

### **Architecture Documentation**
- `/ARCHITECTURE.md` - Complete system architecture
- `/FRONTEND-ARCHITECTURE.md` - Svelte frontend details
- `/SUMMARY.md` - Architecture analysis and improvements

### **Development Guides**  
- `/code/CLAUDE.md` - Backend development
- `/code/src/iris/CLAUDE.md` - Frontend development
- `/docker/CLAUDE.md` - Container and deployment

### **Testing Resources**
- OCaml test commands: `make test-terrat`
- Frontend test commands: `npm run test`
- Development server: `npm run dev`

---

## 🏁 **Conclusion**

This strategic bugfix plan transforms 31 disparate issues into a coherent development roadmap. By starting with simple, high-impact fixes and building toward complex infrastructure improvements, we establish sustainable development momentum while delivering continuous user value.

**Success Formula**: Quick wins → Confidence → Complex features → Infrastructure excellence

### **Current Status Assessment (Week 7)**

The team has demonstrated strong technical execution with 169 commits and significant infrastructure improvements. However, focus has drifted from the customer-avaloq issue backlog to other priorities.

**Key Achievements:**
- ✅ Issue #56 implementation complete
- ✅ Comprehensive architecture documentation
- ✅ Multiple critical bug fixes

**Areas for Improvement:**
- ⚠️ Need to merge and deploy Issue #56
- ⚠️ Behind schedule on Phase 1-2 issues (#53, #64, #28)
- ⚠️ Need to refocus on customer-avaloq backlog

### **Recommended Path Forward**

1. **This Week**: Merge Issue #56 and validate in production
2. **Next 2 Weeks**: Execute Issues #53, #64, #28 (complete Phase 1)
3. **Month 2**: Execute Phase 2 enhancements (#61, #24, #60, #26)
4. **Month 3**: Begin Phase 3 API work

**Immediate Action**: Complete Issue #56 deployment and resume Phase 1-2 execution! 🚀

---

**Last Updated**: October 25, 2025 | **Next Review**: November 8, 2025