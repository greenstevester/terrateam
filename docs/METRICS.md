# Terrateam Metrics Documentation

This document provides comprehensive documentation for all Prometheus metrics exposed by Terrateam for monitoring and observability.

## Overview

Terrateam exposes metrics in Prometheus format for monitoring system health, performance, and operational status. All metrics are prefixed with `terrat_` and organized by subsystem.

## Metrics Endpoint

- **URL**: `/metrics`
- **Format**: Prometheus text format
- **Update Frequency**: Real-time (updated on each collection)

---

## Metric Categories

### 1. **Nginx Metrics** (`terrat_nginx_*`)

HTTP proxy and web server metrics.

#### `terrat_nginx_active_connections`
- **Type**: Gauge
- **Description**: Number of current active connections to the nginx server
- **Use Case**: Monitor current load and connection capacity
- **Alert Thresholds**:
  - Warning: > 80% of max_connections
  - Critical: > 95% of max_connections

#### `terrat_nginx_accepts_count`
- **Type**: Gauge (Counter-like)
- **Description**: Total number of accepted client connections since server start
- **Use Case**: Track connection acceptance rate and identify connection issues
- **Calculation**: Rate of change indicates connections per second

#### `terrat_nginx_handled_count`
- **Type**: Gauge (Counter-like)
- **Description**: Total number of handled connections since server start
- **Use Case**: Compare with `accepts_count` to detect dropped connections
- **Alert**: If `handled_count < accepts_count`, connections are being dropped

#### `terrat_nginx_requests_count`
- **Type**: Gauge (Counter-like)
- **Description**: Total number of client requests since server start
- **Use Case**: Monitor request rate and throughput
- **Calculation**: `requests_count / handled_count` = average requests per connection

#### `terrat_nginx_reading`
- **Type**: Gauge
- **Description**: Current number of connections where nginx is reading the request header
- **Use Case**: Monitor request processing pipeline health
- **Alert Threshold**: Consistently high values may indicate slow clients

#### `terrat_nginx_writing`
- **Type**: Gauge
- **Description**: Current number of connections where nginx is writing the response back to the client
- **Use Case**: Monitor response delivery health
- **Alert Threshold**: Consistently high values may indicate slow clients or large responses

#### `terrat_nginx_waiting`
- **Type**: Gauge
- **Description**: Current number of idle client connections waiting for a request (keep-alive)
- **Use Case**: Monitor connection reuse efficiency
- **Normal Behavior**: Should be relatively stable in steady state

---

### 2. **Storage/Database Metrics** (`terrat_storage_*`)

PostgreSQL connection pool metrics.

#### `terrat_storage_num_conns`
- **Type**: Gauge
- **Description**: Total number of database connections in the pool
- **Use Case**: Monitor connection pool utilization
- **Alert Thresholds**:
  - Warning: > 80% of pool size
  - Critical: At or near max pool size

#### `terrat_storage_num_idle_conns`
- **Type**: Gauge
- **Description**: Number of idle database connections available for reuse
- **Use Case**: Monitor connection pool health and efficiency
- **Good Practice**: `num_idle_conns / num_conns` should be 20-40% in steady state
- **Alert**: If `num_idle_conns` is consistently 0, may need to increase pool size

---

### 3. **GitHub API Metrics** (`terrat_github_*`)

GitHub API integration metrics.

#### `terrat_github_call_retries_total`
- **Type**: Counter
- **Description**: Total number of GitHub API call retries due to rate limiting or transient errors
- **Use Case**: Monitor API reliability and rate limit issues
- **Alert Threshold**: Sudden increases indicate API issues or rate limit pressure

#### `terrat_github_fn_call_total{fn="<function_name>"}`
- **Type**: Counter with label
- **Description**: Total number of calls to specific GitHub API functions
- **Labels**: `fn` - the function name being called
- **Use Case**: Track usage patterns and identify high-traffic API calls
- **Analysis**: Rate of change indicates calls per second for each function

---

### 4. **GitHub VCS API Metrics** (`terrat_vcs_api_github_*`)

Low-level GitHub VCS API client metrics.

#### `terrat_vcs_api_github_http_calls_total{method="<method>",status="<status>"}`
- **Type**: Counter with labels
- **Description**: Total number of HTTP API calls to GitHub
- **Labels**:
  - `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
  - `status`: HTTP response status code (200, 404, 429, 500, etc.)
- **Use Case**: Monitor API health, error rates, and rate limiting
- **Alert Conditions**:
  - High rate of 429 (rate limited) responses
  - High rate of 5xx errors
  - Unusual patterns in 4xx errors

#### `terrat_vcs_api_github_fetch_pull_request_errors_total`
- **Type**: Counter
- **Description**: Total number of errors when fetching pull request information
- **Use Case**: Monitor PR fetch reliability
- **Alert Threshold**: Any non-zero rate indicates integration issues

#### `terrat_vcs_api_github_pull_request_ops_total{op="<operation>"}`
- **Type**: Counter with label
- **Description**: Total number of pull request operations performed
- **Labels**: `op` - operation type (fetch, create, update, comment, etc.)
- **Use Case**: Track PR operation patterns and identify bottlenecks

---

### 5. **GitLab API Metrics** (`terrat_vcs_api_gitlab_*`)

GitLab API integration metrics (parallel to GitHub).

#### `terrat_vcs_api_gitlab_call_retries_total`
- **Type**: Counter
- **Description**: Total number of GitLab API call retries
- **Use Case**: Monitor GitLab API reliability
- **Alert Threshold**: Sudden increases indicate API issues

#### `terrat_vcs_api_gitlab_fn_call_total{fn="<function_name>"}`
- **Type**: Counter with label
- **Description**: Total number of calls to specific GitLab API functions
- **Labels**: `fn` - the function name being called
- **Use Case**: Track GitLab API usage patterns

---

### 6. **GitHub Event Processing Metrics** (`terrat_vcs_service_github_*`)

GitHub webhook event processing metrics.

#### `terrat_vcs_service_github_workflow_dispatch_errors_total{error_type="<type>"}`
- **Type**: Counter with label
- **Description**: Total number of errors when dispatching GitHub Actions workflows
- **Labels**: `error_type` - type of error encountered
- **Use Case**: Monitor workflow dispatch reliability
- **Alert**: Any sustained error rate indicates integration issues

#### `terrat_vcs_service_github_events_processed_total{event_type="<type>",outcome="<outcome>"}`
- **Type**: Counter with labels
- **Description**: Total number of GitHub webhook events processed
- **Labels**:
  - `event_type`: Type of GitHub event (pull_request, push, workflow_job, etc.)
  - `outcome`: Processing outcome (success, error, ignored)
- **Use Case**: Monitor event processing health and patterns
- **Analysis**: Track event volume and success rates by type

#### `terrat_vcs_service_github_events_concurrent`
- **Type**: Gauge
- **Description**: Current number of GitHub events being processed concurrently
- **Use Case**: Monitor event processing concurrency and capacity
- **Alert Threshold**: Consistently at or near maximum indicates capacity issues

---

### 7. **GitLab Event Processing Metrics** (`terrat_vcs_service_gitlab_*`)

GitLab webhook event processing metrics (parallel to GitHub).

#### `terrat_vcs_service_gitlab_pipeline_errors_total{error_type="<type>"}`
- **Type**: Counter with label
- **Description**: Total number of errors when triggering GitLab CI pipelines
- **Labels**: `error_type` - type of error encountered
- **Use Case**: Monitor pipeline trigger reliability

#### `terrat_vcs_service_gitlab_events_processed_total{event_type="<type>",outcome="<outcome>"}`
- **Type**: Counter with labels
- **Description**: Total number of GitLab webhook events processed
- **Labels**:
  - `event_type`: Type of GitLab event (merge_request, push, pipeline, etc.)
  - `outcome`: Processing outcome (success, error, ignored)
- **Use Case**: Monitor GitLab event processing health

#### `terrat_vcs_service_gitlab_events_concurrent`
- **Type**: Gauge
- **Description**: Current number of GitLab events being processed concurrently
- **Use Case**: Monitor GitLab event processing capacity

---

### 8. **Event Evaluator Metrics** (`terrat_vcs_event_evaluator_*`)

Metrics for the event evaluation and processing engine.

#### `terrat_vcs_event_evaluator_op_on_account_disabled_total`
- **Type**: Counter
- **Description**: Total number of operations attempted on disabled accounts
- **Use Case**: Monitor account status issues and unauthorized access attempts
- **Alert**: Non-zero rate may indicate configuration issues or security concerns

#### `terrat_vcs_event_evaluator_run_created_total{type="<type>",trigger="<trigger>"}`
- **Type**: Counter with labels
- **Description**: Total number of Terraform runs created
- **Labels**:
  - `type`: Run type (plan, apply, index, drift)
  - `trigger`: What triggered the run (pr_comment, push, schedule, etc.)
- **Use Case**: Track run creation patterns and automation effectiveness
- **Analysis**: Breakdown of run types and triggers over time

#### `terrat_vcs_event_evaluator_run_errors_total{type="<type>",error_stage="<stage>"}`
- **Type**: Counter with labels
- **Description**: Total number of run creation or processing errors
- **Labels**:
  - `type`: Run type that failed
  - `error_stage`: Stage where error occurred (validation, creation, execution)
- **Use Case**: Monitor run reliability and identify error patterns
- **Alert Threshold**: High error rates indicate system issues

---

### 9. **Health Check Metrics** (`terrat_ep_health_check_*`)

Health check endpoint metrics.

#### `terrat_ep_health_check_requests_total`
- **Type**: Counter
- **Description**: Total number of health check requests received
- **Use Case**: Monitor health check traffic (load balancers, monitoring systems)

#### `terrat_ep_health_check_responses_total{result="<result>"}`
- **Type**: Counter with label
- **Description**: Total number of health check responses by result
- **Labels**: `result` - health check result (healthy, unhealthy, degraded)
- **Use Case**: Monitor system health status over time
- **Alert**: Sustained "unhealthy" responses indicate system issues

#### `terrat_ep_health_check_requests_concurrent`
- **Type**: Gauge
- **Description**: Current number of health check requests being processed
- **Use Case**: Typically should be 0 or 1; high values indicate health check issues

---

### 10. **Infracost Integration Metrics** (`terrat_ep_infracost_*`)

Metrics for Infracost cost estimation integration.

#### `terrat_ep_infracost_requests_total`
- **Type**: Counter
- **Description**: Total number of Infracost API requests made
- **Use Case**: Monitor cost estimation usage and API traffic

#### `terrat_ep_infracost_responses_total{result="<result>"}`
- **Type**: Counter with label
- **Description**: Total number of Infracost API responses by result
- **Labels**: `result` - API call result (success, error, timeout)
- **Use Case**: Monitor Infracost integration reliability
- **Alert**: High error rates indicate integration issues

#### `terrat_ep_infracost_requests_concurrent`
- **Type**: Gauge
- **Description**: Current number of Infracost API requests in flight
- **Use Case**: Monitor concurrent cost estimation requests and capacity

---

### 11. **Tenv Tool Management Metrics** (`terrat_ep_tenv_*`)

Metrics for terraform/tofu version management via tenv.

#### `terrat_ep_tenv_downloads_total{tool="<tool>",version="<version>",result="<result>"}`
- **Type**: Counter with labels
- **Description**: Total number of tool downloads via tenv
- **Labels**:
  - `tool`: Tool name (terraform, tofu)
  - `version`: Specific version downloaded
  - `result`: Download result (success, error, cached)
- **Use Case**: Monitor tool version usage and download patterns
- **Analysis**: Identify most-used versions and download success rates

---

### 12. **Error Tracking Metrics** (`terrat_errors_total`)

General error tracking across all modules.

#### `terrat_errors_total{module="<module>",type="<type>"}`
- **Type**: Counter with labels
- **Description**: Total number of errors by module and type
- **Labels**:
  - `module`: Module where error occurred (api, workflow, storage, etc.)
  - `type`: Error type or category
- **Use Case**: High-level error monitoring and trend analysis
- **Alert**: Sudden increases in any module's error rate

---

## Monitoring Best Practices

### Recommended Dashboards

#### **System Health Dashboard**
- nginx active connections and request rate
- Database connection pool utilization
- Concurrent event processing
- Error rates by module

#### **API Health Dashboard**
- GitHub/GitLab API call rates and error rates
- Rate limit (429) response tracking
- API retry counts
- Function-level API usage breakdown

#### **Operations Dashboard**
- Run creation rates by type and trigger
- Run error rates by stage
- Workflow dispatch success rates
- Event processing latency

#### **Capacity Planning Dashboard**
- Connection pool utilization trends
- Concurrent request processing
- Event processing concurrency
- API rate limit consumption

### Alert Recommendations

#### **Critical Alerts**
1. **Database Connections Exhausted**: `terrat_storage_num_idle_conns == 0` for > 5 minutes
2. **High Error Rate**: `rate(terrat_errors_total[5m]) > threshold`
3. **Health Check Failures**: `terrat_ep_health_check_responses_total{result="unhealthy"}` increasing
4. **Event Processing Stalled**: `terrat_vcs_service_*_events_concurrent` stuck at maximum

#### **Warning Alerts**
1. **API Rate Limiting**: `rate(terrat_vcs_api_*_http_calls_total{status="429"}[5m]) > 0`
2. **High Retry Rate**: `rate(terrat_*_call_retries_total[10m]) > threshold`
3. **Connection Pool Pressure**: `terrat_storage_num_conns / max_conns > 0.8`
4. **Nginx Connection Drops**: `terrat_nginx_accepts_count - terrat_nginx_handled_count` increasing

### Query Examples

#### Calculate Request Rate
```promql
rate(terrat_nginx_requests_count[5m])
```

#### API Error Rate by Status Code
```promql
sum(rate(terrat_vcs_api_github_http_calls_total{status=~"5.."}[5m])) by (status)
```

#### Database Connection Pool Utilization
```promql
(terrat_storage_num_conns - terrat_storage_num_idle_conns) / terrat_storage_num_conns * 100
```

#### Event Processing Success Rate
```promql
sum(rate(terrat_vcs_service_github_events_processed_total{outcome="success"}[5m]))
/
sum(rate(terrat_vcs_service_github_events_processed_total[5m])) * 100
```

#### Run Creation by Type
```promql
sum(rate(terrat_vcs_event_evaluator_run_created_total[5m])) by (type)
```

---

## Troubleshooting Guide

### High API Error Rates
**Symptoms**: `terrat_vcs_api_*_http_calls_total{status=~"5.."}` increasing rapidly

**Possible Causes**:
1. GitHub/GitLab API outage or degradation
2. Network connectivity issues
3. Authentication token expiration
4. Rate limiting (check for 429 responses)

**Investigation Steps**:
1. Check `terrat_vcs_api_*_http_calls_total{status="429"}` for rate limiting
2. Verify external API status pages
3. Review application logs for detailed error messages
4. Check authentication token validity

### Database Connection Pool Exhaustion
**Symptoms**: `terrat_storage_num_idle_conns == 0` and slow response times

**Possible Causes**:
1. Connection leaks (connections not properly released)
2. Insufficient pool size for current load
3. Long-running queries blocking connections
4. Database performance issues

**Investigation Steps**:
1. Check `terrat_storage_num_conns` trend over time
2. Review database query performance
3. Check for long-running transactions
4. Consider increasing pool size if sustained high usage

### Event Processing Backlog
**Symptoms**: `terrat_vcs_service_*_events_concurrent` consistently at maximum

**Possible Causes**:
1. High event volume from VCS provider
2. Slow event processing (database, API calls)
3. Resource constraints (CPU, memory)
4. Downstream service degradation

**Investigation Steps**:
1. Check event processing duration metrics
2. Review system resource utilization
3. Investigate slow API calls or database queries
4. Consider scaling event processing capacity

---

## Metric Retention and Storage

### Prometheus Configuration

Recommended Prometheus configuration:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'terrateam'
    static_configs:
      - targets: ['terrateam:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s
```

### Retention Recommendations

- **Short-term (15 days)**: High-resolution metrics for recent troubleshooting
- **Medium-term (90 days)**: Aggregated metrics for trend analysis
- **Long-term (1 year)**: High-level metrics for capacity planning

---

## Related Documentation

- [Architecture Documentation](../ARCHITECTURE.md) - System architecture overview
- [Deployment Guide](../docker/CLAUDE.md) - Deployment and infrastructure setup
- [API Documentation](../api_schemas/README.md) - API schema and integration details
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md) - Common issues and solutions

---

**Last Updated**: October 25, 2025
**Version**: 1.0
**Status**: Complete metric catalog as of Terrateam v1.x

For questions or additions to this documentation, please open an issue in the [customer-avaloq repository](https://github.com/terrateamio/customer-avaloq/issues).
