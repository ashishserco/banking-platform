# Banking Platform Observability Stack

This directory contains the complete observability stack for the Banking Platform, providing comprehensive monitoring, logging, and alerting capabilities.

## Overview

The observability stack consists of:

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Metrics visualization and dashboards
- **Elasticsearch**: Log storage and indexing
- **Kibana**: Log analysis and visualization
- **Fluent Bit**: Log collection and forwarding

## Quick Start

### Deploy Complete Stack

```bash
# Make deployment script executable
chmod +x deploy-observability.sh

# Deploy observability stack
./deploy-observability.sh development observability
```

### Access Dashboards

After deployment, access the following dashboards:

- **Grafana**: http://localhost:3000 (admin/banking-platform-admin)
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

## Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Banking App      │    │    Fluent Bit      │    │   Elasticsearch     │
│   (Microservices)   │───▶│  (Log Collection)   │───▶│   (Log Storage)     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                                                      │
           │ /metrics                                             ▼
           ▼                                           ┌─────────────────────┐
┌─────────────────────┐                               │      Kibana         │
│    Prometheus       │                               │  (Log Analysis)     │
│ (Metrics Collection)│                               └─────────────────────┘
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│      Grafana        │
│ (Metrics Dashboard) │
└─────────────────────┘
```

## Components

### Prometheus Configuration

**Purpose**: Collects metrics from all banking services
**Key Features**:
- Service discovery for Kubernetes pods
- Custom banking metrics collection
- Alert rule evaluation
- 30-day data retention

**Configuration Files**:
- `prometheus/prometheus-config.yaml`: Main configuration
- `prometheus/alert-rules.yml`: Banking-specific alerts

**Sample Metrics**:
```promql
# Transaction rate by service
rate(banking_requests_total[5m])

# Transaction success rate
sum(rate(banking_requests_total{code=~"2.."}[5m])) / sum(rate(banking_requests_total[5m]))

# Response time 95th percentile
histogram_quantile(0.95, sum(rate(banking_request_duration_ms_bucket[5m])) by (le))
```

### Grafana Dashboards

**Purpose**: Visualizes metrics and business KPIs
**Key Dashboards**:
- Banking Platform Overview
- Service Health Monitoring
- Transaction Analytics
- Security Monitoring

**Dashboard Features**:
- Real-time transaction volumes
- Service health indicators
- Error rate monitoring
- Performance metrics

### ELK Stack (Elasticsearch + Kibana + Fluent Bit)

**Purpose**: Centralized logging and log analysis
**Components**:

**Elasticsearch**:
- Stores structured logs from all services
- Banking-specific index templates
- Index lifecycle management (90-day retention)
- Optimized for banking query patterns

**Kibana**:
- Log search and analysis
- Pre-configured banking dashboards
- Security event monitoring
- Custom visualizations

**Fluent Bit**:
- Collects logs from Kubernetes pods
- Parses structured JSON logs
- Enriches logs with Kubernetes metadata
- Filters banking-platform namespaces only

## Banking-Specific Configuration

### Custom Metrics

The platform exposes banking-specific metrics:

```promql
# Transaction processing metrics
transaction_processed_total{service="transaction-service", type="transfer"}
transaction_duration_seconds{service="transaction-service", operation="transfer"}
transaction_amount_histogram{service="transaction-service", currency="USD"}

# Account service metrics
account_creation_total{service="account-service"}
balance_inquiry_total{service="account-service"}
kyc_verification_duration_seconds{service="account-service"}

# Payment service metrics
payment_processed_total{service="payment-service", type="bill_payment"}
external_gateway_response_time{service="payment-service", gateway="mock"}
idempotency_key_duplicates_total{service="payment-service"}

# Security metrics
authentication_attempts_total{service="account-service", result="success"}
authorization_failures_total{service="*"}
suspicious_activity_detected_total{service="*"}
```

### Alert Rules

Banking-specific alerts monitor:

**Business Metrics**:
- High transaction failure rate (>5%)
- Unusual transaction volume patterns
- Payment service latency issues
- Authentication failure spikes

**Infrastructure Metrics**:
- Service availability
- Resource utilization
- Database connection pools
- Pod crash loops

**Security Metrics**:
- Authentication failures
- Unauthorized access attempts
- Rate limiting violations

### Log Structure

All banking services use structured JSON logging:

```json
{
  "@timestamp": "2025-12-18T14:30:00.000Z",
  "level": "Information",
  "message": "Transaction processed successfully",
  "service": "transaction-service",
  "namespace": "banking-platform",
  "pod": "transaction-service-7d8f6b5c9-x2h4j",
  "customer_id": "cust_123456",
  "transaction_id": "txn_789012",
  "correlation_id": "req_345678",
  "banking_operation": "money_transfer",
  "account_number": "ACC001234567890",
  "amount": 500.00,
  "currency": "USD",
  "transaction_type": "TRANSFER",
  "status_code": 200,
  "response_time": 245.5,
  "security": {
    "authentication_status": "success",
    "user_id": "user_456789",
    "role": "customer"
  },
  "performance": {
    "cpu_usage": 45.2,
    "memory_usage": 512.8,
    "database_query_time": 15.3
  }
}
```

## Operations

### Deployment Commands

```bash
# Deploy complete stack
./deploy-observability.sh development observability

# Deploy individual components
kubectl apply -f prometheus/ -n observability
kubectl apply -f grafana/ -n observability
kubectl apply -f efk/ -n observability
```

### Monitoring Commands

```bash
# Check component status
kubectl get pods -n observability

# View logs
kubectl logs -f deployment/prometheus -n observability
kubectl logs -f deployment/grafana -n observability
kubectl logs -f daemonset/fluent-bit -n observability

# Port forwarding for local access
kubectl port-forward svc/grafana 3000:3000 -n observability
kubectl port-forward svc/kibana 5601:5601 -n observability
kubectl port-forward svc/prometheus 9090:9090 -n observability
```

### Data Management

**Log Retention**:
- Hot tier: 7 days (fast access)
- Warm tier: 30 days (slower access)
- Cold tier: 90 days (archived)
- Delete: After 90 days

**Metrics Retention**:
- Prometheus: 30 days
- Grafana: Depends on Prometheus
- Long-term storage: Azure Monitor (optional)

### Scaling Operations

```bash
# Scale Elasticsearch
kubectl scale statefulset elasticsearch --replicas=3 -n observability

# Scale Grafana
kubectl scale deployment grafana --replicas=2 -n observability

# Scale Prometheus (for HA)
kubectl scale deployment prometheus --replicas=2 -n observability
```

### Backup and Recovery

**Elasticsearch Snapshots**:
```bash
# Create snapshot repository
curl -X PUT "elasticsearch:9200/_snapshot/banking_backup" -H 'Content-Type: application/json' -d'
{
  "type": "azure",
  "settings": {
    "account": "mystorageaccount",
    "key": "mystoragekey",
    "container": "banking-snapshots"
  }
}'

# Create snapshot
curl -X PUT "elasticsearch:9200/_snapshot/banking_backup/snapshot_1"
```

**Prometheus Data**:
- Use persistent volumes for data retention
- Regular snapshots to Azure Blob Storage
- Consider Thanos for long-term storage

## Troubleshooting

### Common Issues

**Elasticsearch Issues**:
```bash
# Check cluster health
curl -X GET "elasticsearch:9200/_cluster/health?pretty"

# Check indices
curl -X GET "elasticsearch:9200/_cat/indices?v"

# Clear old indices
curl -X DELETE "elasticsearch:9200/banking-logs-2023.01.01"
```

**Prometheus Issues**:
```bash
# Check targets
curl -X GET "prometheus:9090/api/v1/targets"

# Reload configuration
curl -X POST "prometheus:9090/-/reload"

# Check alerts
curl -X GET "prometheus:9090/api/v1/alerts"
```

**Grafana Issues**:
```bash
# Reset admin password
kubectl exec -it deployment/grafana -n observability -- grafana-cli admin reset-admin-password newpassword

# Import dashboard
curl -X POST "admin:password@grafana:3000/api/dashboards/db" -H 'Content-Type: application/json' -d @dashboard.json
```

### Performance Tuning

**Elasticsearch**:
- Increase heap size: `-Xms2g -Xmx2g`
- Optimize index settings for banking data
- Use SSD storage for better performance

**Prometheus**:
- Adjust retention period based on needs
- Use recording rules for complex queries
- Consider federation for multiple clusters

**Grafana**:
- Enable query caching
- Optimize dashboard queries
- Use template variables for efficiency

## Security Considerations

### Authentication
- Grafana: Admin credentials via Kubernetes secrets
- Elasticsearch: Authentication disabled for demo (enable in production)
- Prometheus: No authentication (use network policies)

### Network Security
- Use Kubernetes network policies
- Restrict inter-service communication
- Enable TLS for external access

### Data Protection
- Encrypt data at rest
- Use secrets for sensitive configuration
- Regular security updates

## Integration with Banking Platform

The observability stack is designed to work seamlessly with:

- **Helm Charts**: Automatic service discovery
- **Istio Service Mesh**: Enhanced metrics and tracing
- **Docker Containers**: Log collection from all containers
- **Azure Services**: Integration with Azure Monitor

## Production Readiness

For production deployment:

1. **Enable Security**: Authentication, authorization, TLS
2. **High Availability**: Multi-replica deployments
3. **Persistent Storage**: Use Azure Disk for data persistence
4. **Backup Strategy**: Regular snapshots and exports
5. **Monitoring**: Monitor the monitoring stack itself
6. **Capacity Planning**: Size components based on expected load

## Next Steps

After deploying the observability stack:

1. **Deploy Banking Platform**: Use Helm charts with observability enabled
2. **Configure Alerts**: Set up AlertManager for notifications
3. **Create Custom Dashboards**: Build business-specific visualizations
4. **Set SLOs**: Define service level objectives
5. **Train Team**: Ensure operations team understands the stack