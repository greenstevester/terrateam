# Terrateam Customer-Avaloq Issues: Strategic Bugfix Plan

**Repository**: https://github.com/terrateamio/customer-avaloq/issues  
**Analysis Date**: September 3, 2025  
**Total Issues**: 31 open issues analyzed  
**Strategy**: Simplest first, building momentum toward complex features

---

## 📊 **Executive Summary**

This plan prioritizes 31 open issues in the customer-avaloq repository, organizing them into 4 phases from simplest to most complex. The strategy focuses on quick wins to build development momentum while establishing patterns for tackling larger architectural challenges.

**Key Metrics:**
- **Phase 1-2**: 8 issues resolved in first month (quick wins)
- **Phase 3-4**: 15+ issues resolved by end of quarter
- **Immediate Start**: Issue #56 (action type environment variable)

---

## 🎯 **Complete Issue Inventory**

### **All 31 Open Issues (By Complexity)**

| # | Title | Type | Complexity | Priority |
|---|-------|------|------------|----------|
| 56 | Create env var for action type | Feature | ⭐ Simple | 1 |
| 53 | Terrateam Workflow dynamic title | Improvement | ⭐ Simple | 2 |
| 64 | Display approval requirements and approvers | None | ⭐ Simple | 3 |
| 28 | Approval during plan operation | Improvement | ⭐ Simple | 4 |
| 61 | Support markdown in PR output for OPA | None | ⭐⭐ Medium | 5 |
| 24 | Investigate lock message on plan completion | Improvement | ⭐⭐ Medium | 6 |
| 60 | Provide parameters in `dir` for workflows | None | ⭐⭐ Medium | 7 |
| 26 | GitHub Actions Debug Logging | Feature | ⭐⭐ Medium | 8 |
| 66 | API endpoint to detect PRs with partial applies | None | ⭐⭐⭐ High | 9 |
| 16 | Report for PRs applied but not merged | Feature | ⭐⭐⭐ High | 10 |
| 62 | Directory must exist on plan | None | ⭐⭐⭐ High | 11 |
| 5 | Workflow fails without notifying user | Bug | ⭐⭐⭐ High | 12 |
| 71 | Selective filtering for plan output | None | ⭐⭐⭐⭐ Very High | 13 |
| 65 | Add output hashing to skip deployments | None | ⭐⭐⭐⭐ Very High | 14 |
| 72 | GitHub Actions log cleanup | None | ⭐⭐⭐⭐ Very High | 15 |
| 39 | PostgreSQL v15 upgrade | Improvement | ⭐⭐⭐⭐⭐ Critical | 16 |
| 46 | Set Docker USER to non-root (action) | Improvement | ⭐⭐⭐⭐⭐ Critical | 17 |
| 32 | Set Docker USER to non-root (server) | Improvement | ⭐⭐⭐⭐⭐ Critical | 18 |
| 35 | Deprecate unsafe self-signed certs | Improvement | ⭐⭐⭐⭐⭐ Critical | 19 |
| 25 | Large container image optimizations | Improvement | ⭐⭐⭐⭐⭐ Critical | 20 |
| 31 | Support errored.tfstate management | Feature | ⭐⭐⭐⭐⭐ Critical | 21 |
| 70 | Config builder enhancements | None | ⭐⭐⭐⭐⭐ Critical | 22 |
| 23 | Require review of manual state changes | Feature | ⭐⭐⭐⭐⭐ Critical | 23 |
| 1 | GitHub workflow file update handling | Issue | ⭐⭐⭐⭐⭐ Critical | 24 |
| 69 | CODEOWNERS like support | None | ⭐⭐⭐⭐⭐⭐ Epic | 25 |
| 68 | Terraform Destroy | None | ⭐⭐⭐⭐⭐⭐ Epic | 26 |
| 36 | OpenTofu State Encryption + Vault | Question | ⭐⭐⭐⭐⭐⭐ Epic | 27 |
| 49 | GitHub Action smoke test framework | Improvement | ⭐⭐⭐⭐⭐⭐ Epic | 28 |
| 38 | Disaster Recovery review | Training | ⭐⭐⭐⭐⭐⭐ Epic | 29 |

---

## 🚀 **4-Phase Implementation Strategy**

### **🟢 Phase 1: Quick Wins (Weeks 1-2)**

**Goal**: Build momentum with simple, high-impact fixes

#### **Issue #56: Create env var for action type** ⭐ **START HERE**
**Timeline**: 1-2 days  
**Impact**: High (enables workflow conditional logic)  
**Complexity**: Very Low

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

**Phase 2 Deliverables:**
- 8 issues resolved in first month
- Improved user experience across core workflows
- Established development rhythm and testing patterns

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

#### **Security Improvements** (#46, #32, #35)
**Timeline**: 1-2 weeks each
**Impact**: Critical (production security)

#### **Performance Optimizations** (#25, #65, #71, #72)  
**Timeline**: 2-4 weeks each
**Impact**: High (operational efficiency)

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

### **Week 2 Checkpoint**
- ✅ Issues #56, #53 completed
- ✅ Development workflow established
- ✅ Team confidence building

### **Month 1 Milestone**
- ✅ 8 issues resolved (Phase 1-2 complete)
- ✅ Improved user feedback scores
- ✅ Reliable development and deployment cycle

### **Month 2 Milestone** 
- ✅ 12 issues resolved (Phase 3 partial)
- ✅ Advanced API endpoints operational
- ✅ Comprehensive monitoring in place

### **Quarter End Goal**
- ✅ 15+ issues resolved
- ✅ Major infrastructure improvements complete
- ✅ Robust foundation for advanced features

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

### **Immediate Actions (This Week)**
1. **Start Issue #56** - Create env var for action type
2. **Set up development environment** - Follow `/ARCHITECTURE.md` setup guide  
3. **Create feature branch** - `fix/issue-56-action-type-env-var`
4. **Review OCaml workflow execution code** - Understand current architecture

### **Week 2 Goals**
1. Complete Issue #56 testing and documentation
2. Begin Issue #53 (dynamic workflow titles)
3. Establish regular progress reviews
4. Document any architectural discoveries

### **Communication Plan**
- **Daily**: Progress updates on current issue
- **Weekly**: Phase milestone reviews
- **Monthly**: Stakeholder progress reports
- **Quarterly**: Strategic plan adjustments

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

**Immediate Action**: Begin with Issue #56 today for maximum impact and team momentum! 🚀