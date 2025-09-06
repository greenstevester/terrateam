# Terrateam Workflow Environment Variables

This document describes the environment variables available in Terrateam workflows and provides practical examples for conditional workflow logic.

---

## Overview

Terrateam provides several environment variables that can be used in workflow steps to create conditional logic, customize behavior, and integrate with external systems.

---

## Available Environment Variables

### **TERRATEAM_ACTION_TYPE** 🆕

**Description**: Indicates the type of operation being executed in the current workflow run.

**Possible Values**:
- `"plan"` - Terraform plan operations
- `"apply"` - Terraform apply operations (including unsafe apply)
- `"config_builder"` - Build configuration operations
- `"tree_builder"` - Build tree operations
- `"index"` - Index operations
- `"drift"` - Drift detection operations
- `"unknown"` - Fallback for edge cases

**Use Cases**: Conditional workflow steps, operation-specific notifications, custom validation logic

### **Other Standard Variables**

- `TERRATEAM_ROOT` - Root directory of the Terrateam workspace
- `SECRETS_CONTEXT` - JSON representation of GitHub secrets (in GitHub Actions)
- `VARIABLES_CONTEXT` - JSON representation of GitHub variables (in GitHub Actions)
- `environment` - Environment name (if specified)

---

## Usage Examples

### **Basic Conditional Logic**

```yaml
workflows:
  - tag_query: production
    plan:
      - type: run
        cmd: ['echo', 'Starting workflow...']
        
      # Plan-specific validation
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        cmd: ['terraform', 'fmt', '-check']
        
      # Apply-specific notifications
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['./scripts/notify-deployment.sh', 'started']
        
      - type: plan
```

### **Advanced Conditional Workflows**

#### **1. Environment-Specific Operations**

```yaml
workflows:
  - tag_query: production
    plan:
      # Always run security checks
      - type: run
        cmd: ['./scripts/security-scan.sh']
        
      # Production-specific approval validation (plan only)
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        cmd: ['./scripts/validate-approvals.sh', 'production']
        
      # Production deployment notification (apply only)
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['/bin/bash', '-c', 'curl -X POST "$SLACK_WEBHOOK" -H "Content-Type: application/json" -d "{\"text\": \"🚀 Production deployment started for ${GITHUB_REF}\"}"']
        
      - type: plan
```

#### **2. Operation-Specific Validations**

```yaml
workflows:
  - tag_query: infrastructure
    plan:
      # Configuration validation for config builder
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'config_builder'
        cmd: ['./scripts/validate-config.sh']
        
      # Terraform syntax validation for plans
      - type: run  
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        cmd: ['terraform', 'validate']
        
      # Pre-apply safety checks
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['./scripts/pre-apply-checks.sh']
        
      # Drift detection specific logging
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'drift'
        cmd: ['./scripts/log-drift-detection.sh']
        
      - type: plan
```

### **GitHub Actions Integration**

When using GitHub Actions, the `TERRATEAM_ACTION_TYPE` variable is automatically available:

```yaml
# .github/workflows/terrateam.yml
name: 'Terrateam Workflow'
on:
  workflow_dispatch:
    inputs:
      work-token:
        description: 'Work Token'
        required: true
      api-base-url:
        description: 'API Base URL'

jobs:
  terrateam:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Custom step that runs only during plans
      - name: Plan Validation
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        run: |
          echo "Running plan-specific validation..."
          terraform fmt -check
          terraform validate
          
      # Custom step that runs only during applies  
      - name: Deployment Notification
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        run: |
          echo "Sending deployment notification..."
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚀 Deployment started: ${{ github.event.head_commit.message }}\"}"
      
      - name: Run Terrateam Action
        uses: terrateamio/action@v1
        with:
          work-token: '${{ github.event.inputs.work-token }}'
          api-base-url: '${{ github.event.inputs.api-base-url }}'
```

### **GitLab CI Integration**

For GitLab pipelines, the variable is available in the pipeline environment:

```yaml
# .gitlab-ci.yml
terrateam:
  stage: terraform
  script:
    # Plan-specific operations
    - |
      if [ "$TERRATEAM_ACTION_TYPE" = "plan" ]; then
        echo "Running plan-specific checks..."
        terraform fmt -check
        ./scripts/plan-validation.sh
      fi
    
    # Apply-specific operations
    - |
      if [ "$TERRATEAM_ACTION_TYPE" = "apply" ]; then
        echo "Running apply-specific operations..."
        ./scripts/pre-apply-backup.sh
        ./scripts/notify-deployment.sh
      fi
    
    # Run the main Terrateam action
    - terrateam-action
  rules:
    - if: '$CI_PIPELINE_SOURCE == "trigger"'
```

---

## Advanced Use Cases

### **1. Multi-Stage Deployment Workflow**

```yaml
workflows:
  - tag_query: production
    plan:
      # Stage 1: Pre-flight checks (all operations)
      - type: run
        cmd: ['./scripts/preflight-checks.sh']
        
      # Stage 2: Plan-specific validation
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        cmd: ['/bin/bash', '-c', '
          echo "Validating Terraform plan...";
          terraform fmt -check;
          terraform validate;
          ./scripts/cost-estimation.sh;
          ./scripts/security-scan.sh;
        ']
        
      # Stage 3: Apply-specific preparation
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'  
        cmd: ['/bin/bash', '-c', '
          echo "Preparing for deployment...";
          ./scripts/backup-state.sh;
          ./scripts/notify-team.sh "deployment-start";
          ./scripts/set-maintenance-mode.sh "on";
        ']
        
      # Stage 4: Execute main operation
      - type: plan
      
      # Stage 5: Post-apply cleanup
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['/bin/bash', '-c', '
          echo "Post-deployment cleanup...";
          ./scripts/set-maintenance-mode.sh "off";
          ./scripts/notify-team.sh "deployment-complete";
          ./scripts/update-documentation.sh;
        ']
```

### **2. Drift Detection Workflow**

```yaml
workflows:
  - tag_query: drift-detection
    plan:
      # Drift detection specific setup
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'drift'
        cmd: ['/bin/bash', '-c', '
          echo "Setting up drift detection...";
          export TF_LOG=INFO;
          ./scripts/snapshot-current-state.sh;
        ']
        
      # Execute drift detection
      - type: plan
      
      # Process drift results
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'drift'
        cmd: ['/bin/bash', '-c', '
          echo "Processing drift detection results...";
          ./scripts/analyze-drift.sh;
          ./scripts/report-drift.sh;
          ./scripts/alert-if-critical-drift.sh;
        ']
```

### **3. Configuration Management Workflow**

```yaml
workflows:
  - tag_query: config
    plan:
      # Config builder specific validation
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'config_builder'
        cmd: ['/bin/bash', '-c', '
          echo "Validating configuration...";
          ./scripts/validate-yaml.sh;
          ./scripts/check-config-schema.sh;
          ./scripts/validate-environments.sh;
        ']
        
      # Tree builder specific operations  
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'tree_builder'
        cmd: ['/bin/bash', '-c', '
          echo "Building configuration tree...";
          ./scripts/generate-tree.sh;
          ./scripts/validate-dependencies.sh;
        ']
        
      - type: plan
```

---

## Best Practices

### **1. Defensive Scripting**

Always check if the environment variable exists before using it:

```bash
#!/bin/bash
# scripts/conditional-step.sh

ACTION_TYPE=${TERRATEAM_ACTION_TYPE:-"unknown"}

case "$ACTION_TYPE" in
  "plan")
    echo "Running plan-specific logic..."
    terraform fmt -check
    ;;
  "apply")
    echo "Running apply-specific logic..."
    ./backup-state.sh
    ;;
  "drift")
    echo "Running drift-specific logic..."
    ./snapshot-state.sh
    ;;
  *)
    echo "Unknown or unhandled action type: $ACTION_TYPE"
    ;;
esac
```

### **2. Conditional Environment Setup**

```yaml
workflows:
  - tag_query: production
    plan:
      # Set operation-specific environment variables
      - type: run
        cmd: ['/bin/bash', '-c', '
          case "$TERRATEAM_ACTION_TYPE" in
            "plan")
              export TF_LOG=DEBUG
              export VALIDATE_ONLY=true
              ;;
            "apply")
              export TF_LOG=INFO  
              export VALIDATE_ONLY=false
              export BACKUP_ENABLED=true
              ;;
            "drift")
              export TF_LOG=WARN
              export DRIFT_THRESHOLD=5
              ;;
          esac
          
          # Your main script that uses these variables
          ./scripts/main-workflow.sh
        ']
        
      - type: plan
```

### **3. Error Handling**

```bash
#!/bin/bash
# scripts/robust-conditional.sh

set -euo pipefail  # Exit on errors, undefined vars, pipe failures

ACTION_TYPE=${TERRATEAM_ACTION_TYPE:-}

if [ -z "$ACTION_TYPE" ]; then
    echo "Warning: TERRATEAM_ACTION_TYPE not set, defaulting to generic workflow"
    ACTION_TYPE="unknown"
fi

case "$ACTION_TYPE" in
  "plan")
    echo "Executing plan-specific workflow..."
    if ! terraform fmt -check; then
        echo "Error: Terraform formatting check failed"
        exit 1
    fi
    ;;
  "apply")
    echo "Executing apply-specific workflow..."
    if ! ./scripts/pre-apply-checks.sh; then
        echo "Error: Pre-apply checks failed"
        exit 1
    fi
    ;;
  *)
    echo "Executing generic workflow for action type: $ACTION_TYPE"
    ;;
esac
```

---

## Migration Guide

### **Updating Existing Workflows**

If you have existing workflows that want to take advantage of the new `TERRATEAM_ACTION_TYPE` variable, here's how to update them:

#### **Before (generic workflow)**:
```yaml
workflows:
  - tag_query: production
    plan:
      - type: run
        cmd: ['./scripts/validate-and-deploy.sh']
      - type: plan
```

#### **After (conditional workflow)**:
```yaml
workflows:
  - tag_query: production  
    plan:
      # Validation for plans only
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'plan'
        cmd: ['./scripts/validate-plan.sh']
        
      # Deployment preparation for applies only
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['./scripts/prepare-deploy.sh']
        
      - type: plan
      
      # Post-deployment for applies only
      - type: run
        if: env.TERRATEAM_ACTION_TYPE == 'apply'
        cmd: ['./scripts/post-deploy.sh']
```

### **Backward Compatibility**

The `TERRATEAM_ACTION_TYPE` environment variable is additive - existing workflows will continue to work unchanged. The variable is simply available as an additional feature for workflows that want to use conditional logic.

---

## Troubleshooting

### **Variable Not Available**

If `TERRATEAM_ACTION_TYPE` is not available in your workflow:

1. **Check Terrateam Version**: Ensure you're using a version that includes this feature
2. **Verify Workflow Syntax**: Make sure conditional syntax is correct (`env.TERRATEAM_ACTION_TYPE == 'plan'`)
3. **Test with Default**: Use `${TERRATEAM_ACTION_TYPE:-"unknown"}` to provide a fallback

### **Debugging Variable Values**

Add a debug step to see all available environment variables:

```yaml
workflows:
  - tag_query: debug
    plan:
      - type: run
        cmd: ['/bin/bash', '-c', 'echo "Action Type: $TERRATEAM_ACTION_TYPE"; env | grep TERRATEAM | sort']
      - type: plan
```

---

## Examples Repository

For more advanced examples and real-world use cases, see:
- [Terrateam Examples Repository](https://github.com/terrateamio/examples)
- [Customer Implementation Guides](https://docs.terrateam.io/examples)

---

## Related Documentation

- [Terrateam Configuration Reference](https://docs.terrateam.io/configuration-reference)
- [GitHub Actions Integration](https://docs.terrateam.io/github-actions)
- [GitLab CI Integration](https://docs.terrateam.io/gitlab-ci)
- [Workflow Best Practices](https://docs.terrateam.io/best-practices)

---

**Note**: The `TERRATEAM_ACTION_TYPE` environment variable was added in Issue #56 to enable conditional workflow logic based on the type of operation being performed.