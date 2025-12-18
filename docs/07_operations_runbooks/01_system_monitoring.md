# System Monitoring Runbook

## Overview

This runbook provides comprehensive procedures for monitoring the banking platform's health, performance, and availability. It covers proactive monitoring, alerting, and initial troubleshooting steps.

## 📊 Monitoring Dashboard Access

### Primary Dashboards
- **Grafana**: https://grafana.banking-platform.com
- **Kibana**: https://kibana.banking-platform.com
- **Kiali**: https://kiali.banking-platform.com
- **Azure Portal**: Banking Platform Resource Groups

### Quick Access Commands
```bash
# Port forward to local access (if needed)
kubectl port-forward svc/grafana 3000:3000 -n banking-platform-monitoring
kubectl port-forward svc/kibana 5601:5601 -n banking-platform-monitoring
kubectl port-forward svc/kiali 20001:20001 -n istio-system
```

## 🎯 Key Performance Indicators (KPIs)

### Business Metrics
| Metric | Target | Critical Threshold | Alert Level |
|--------|--------|-------------------|-------------|
| Transaction Success Rate | >99.5% | <98% | Critical |
| Account Creation Rate | Normal variance | >3 std dev | Warning |
| API Response Time (P95) | <200ms | >500ms | Critical |
| System Availability | 99.99% | <99.9% | Critical |

### Technical Metrics
| Metric | Target | Critical Threshold | Alert Level |
|--------|--------|-------------------|-------------|
| Pod CPU Usage | <70% | >85% | Warning |
| Pod Memory Usage | <80% | >90% | Critical |
| Database Connections | <80% pool | >95% pool | Critical |
| Disk Space | <70% | >85% | Warning |

## 📈 Monitoring Checklist (Daily)

### Morning Health Check (9:00 AM)
1. **Service Health Status**
   ```bash
   kubectl get pods -n banking-platform-prod
   kubectl top pods -n banking-platform-prod
   ```

2. **Database Health**
   ```bash
   # Check database connections and performance
   az sql db show-usage --name BankingAccountsDb --server banking-platform-prod-sql
   ```

3. **Message Queue Status**
   ```bash
   # Check Service Bus metrics
   az monitor metrics list --resource /subscriptions/.../banking-platform-prod-servicebus
   ```

4. **Security Alerts Review**
   - Check Azure Security Center alerts
   - Review failed authentication attempts
   - Verify SSL certificate expiry dates

### Hourly Checks (Business Hours)
1. **Transaction Volumes**
   - Review current vs. expected transaction rates
   - Check for unusual patterns or spikes
   - Verify payment processing success rates

2. **Error Rate Monitoring**
   - Review application error logs
   - Check HTTP 5xx error rates
   - Monitor database connection failures

3. **Performance Metrics**
   - API response times (P95 and P99)
   - Database query performance
   - Cache hit rates

## 🚨 Alert Response Procedures

### Critical Alerts

#### Service Down (HTTP 5xx > 5%)
**Immediate Actions (0-5 minutes):**
1. Check service pods status:
   ```bash
   kubectl get pods -n banking-platform-prod -l app.kubernetes.io/name=<service-name>
   kubectl describe pod <failing-pod> -n banking-platform-prod
   ```

2. Check service logs:
   ```bash
   kubectl logs -f <pod-name> -n banking-platform-prod --tail=100
   ```

3. Check service endpoints:
   ```bash
   curl -I https://api.banking-platform.com/api/<service>/health
   ```

**Investigation Actions (5-15 minutes):**
1. Review recent deployments:
   ```bash
   helm history banking-platform-prod -n banking-platform-prod
   ```

2. Check resource utilization:
   ```bash
   kubectl top pods -n banking-platform-prod
   kubectl describe hpa -n banking-platform-prod
   ```

3. Review database connectivity:
   ```bash
   # Check database locks and performance
   # Use Azure SQL insights or run performance queries
   ```

**Resolution Actions:**
1. If recent deployment issue - rollback:
   ```bash
   helm rollback banking-platform-prod <previous-revision> -n banking-platform-prod
   ```

2. If resource issue - scale up:
   ```bash
   kubectl scale deployment <service-name> --replicas=<higher-count> -n banking-platform-prod
   ```

#### Database Connection Issues
**Immediate Actions:**
1. Check database server status:
   ```bash
   az sql server show --name banking-platform-prod-sql --resource-group banking-platform-prod-rg
   ```

2. Check connection pool metrics:
   ```bash
   # Review connection pool utilization in Grafana
   # Look for connection timeout errors in application logs
   ```

3. Check database performance:
   ```bash
   # Review slow query log
   # Check for blocking transactions
   ```

**Resolution Steps:**
1. Scale application horizontally to reduce connection pressure
2. Review and optimize slow queries
3. Consider increasing connection pool size
4. If critical - consider database failover

### Warning Alerts

#### High CPU/Memory Usage (>80%)
1. Identify resource-hungry pods:
   ```bash
   kubectl top pods -n banking-platform-prod --sort-by=cpu
   kubectl top pods -n banking-platform-prod --sort-by=memory
   ```

2. Check HPA status:
   ```bash
   kubectl get hpa -n banking-platform-prod
   ```

3. If needed, manually scale:
   ```bash
   kubectl scale deployment <service-name> --replicas=<count> -n banking-platform-prod
   ```

#### Unusual Transaction Patterns
1. Review business metrics in Grafana
2. Check for potential fraud patterns
3. Verify external service dependencies
4. Coordinate with business team if anomalous

## 📋 System Health Verification

### End-to-End Health Check Script
```bash
#!/bin/bash
# health_check.sh - Comprehensive system health verification

echo "🏥 Banking Platform Health Check"
echo "================================="

# Check all pods are running
echo "📊 Pod Status:"
kubectl get pods -n banking-platform-prod | grep -v Running | grep -v Completed

# Check service endpoints
echo "🌐 Service Health Endpoints:"
services=("account" "transaction" "payment" "notification")
for service in "${services[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.banking-platform.com/api/$service/health)
    if [ "$response" -eq 200 ]; then
        echo "✅ $service: Healthy"
    else
        echo "❌ $service: Unhealthy ($response)"
    fi
done

# Check database connectivity
echo "🗄️ Database Connectivity:"
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
    dotnet run --project /app --verify-database-connection

# Check message queue health
echo "📨 Message Queue Status:"
az servicebus namespace show --name banking-platform-prod-servicebus --resource-group banking-platform-prod-rg --query "status"

echo "✅ Health check completed"
```

## 📊 Performance Monitoring

### Key Metrics to Track

#### Application Performance
1. **API Response Times**
   - P50, P95, P99 latencies
   - Request rate and error rate
   - Throughput per service

2. **Database Performance**
   - Query execution times
   - Connection pool utilization
   - Lock wait times
   - Index usage statistics

3. **Cache Performance**
   - Redis hit/miss ratios
   - Memory usage
   - Connection count

#### Infrastructure Performance
1. **Kubernetes Metrics**
   - Pod CPU and memory usage
   - Node resource utilization
   - Network traffic patterns

2. **Azure Service Metrics**
   - Service Bus message processing
   - SQL Database DTU usage
   - Storage account IOPS

### Performance Baseline Establishment
```bash
# Generate performance baseline report
echo "📊 Generating Performance Baseline Report"

# CPU usage baseline
kubectl top nodes
kubectl top pods -n banking-platform-prod --sort-by=cpu

# Memory usage baseline  
kubectl top pods -n banking-platform-prod --sort-by=memory

# Network traffic (requires network monitoring tools)
# Storage IOPS (check Azure metrics)

# Database performance baseline
# Run standard query performance tests
```

## 🔍 Log Analysis Procedures

### Log Aggregation Access
```bash
# Access centralized logs via Kibana
# URL: https://kibana.banking-platform.com

# Or via kubectl for immediate access
kubectl logs -f deployment/banking-platform-prod-account-service -n banking-platform-prod
```

### Common Log Analysis Queries

#### Error Investigation
```json
# Kibana query for errors in last hour
{
  "query": {
    "bool": {
      "must": [
        {"range": {"@timestamp": {"gte": "now-1h"}}},
        {"term": {"level": "ERROR"}},
        {"match": {"kubernetes.namespace": "banking-platform-prod"}}
      ]
    }
  }
}
```

#### Performance Analysis
```json
# Query for slow transactions
{
  "query": {
    "bool": {
      "must": [
        {"range": {"@timestamp": {"gte": "now-30m"}}},
        {"range": {"duration": {"gte": 1000}}},
        {"match": {"operation": "transaction"}}
      ]
    }
  }
}
```

#### Security Event Monitoring
```json
# Failed authentication attempts
{
  "query": {
    "bool": {
      "must": [
        {"range": {"@timestamp": {"gte": "now-1h"}}},
        {"match": {"event_type": "authentication_failure"}},
        {"exists": {"field": "client_ip"}}
      ]
    }
  }
}
```

## 📞 Escalation Procedures

### Level 1 - Operations Team (On-Call)
**Response Time**: Immediate (24/7)
**Scope**: Standard alerts, routine monitoring
**Actions**: 
- Follow runbook procedures
- Attempt basic remediation
- Escalate if unresolved in 15 minutes

### Level 2 - Platform Engineering Team
**Response Time**: 15 minutes during business hours, 30 minutes after hours
**Scope**: Infrastructure issues, complex service problems
**Actions**:
- Deep technical investigation
- Code/configuration fixes
- Architecture decisions

### Level 3 - Management Escalation
**Response Time**: 30 minutes
**Scope**: Business impact, security incidents
**Actions**:
- Business impact assessment
- External communication
- Resource allocation decisions

### Emergency Contact List
```yaml
Operations Team:
  - Primary: +1-555-0101 (John Smith)
  - Secondary: +1-555-0102 (Jane Doe)

Platform Engineering:
  - Lead: +1-555-0201 (Mike Johnson)
  - Senior: +1-555-0202 (Sarah Wilson)

Management:
  - CTO: +1-555-0301 (David Brown)
  - VP Engineering: +1-555-0302 (Lisa Davis)

External Vendors:
  - Azure Support: Case Management Portal
  - Security Firm: +1-555-0401 (24/7)
```

## 🔧 Maintenance Windows

### Scheduled Maintenance
**Frequency**: Monthly (First Sunday, 2:00 AM - 4:00 AM PST)
**Duration**: 2 hours maximum
**Scope**: 
- Security patches
- Minor version updates
- Database maintenance
- Certificate renewals

### Emergency Maintenance
**Trigger**: Critical security vulnerabilities, major service disruption
**Process**:
1. Emergency authorization from management
2. Stakeholder notification (minimum 1 hour advance)
3. Rollback plan prepared
4. Post-maintenance verification

### Pre-Maintenance Checklist
```bash
# 24 hours before maintenance
- [ ] Backup all databases
- [ ] Verify rollback procedures
- [ ] Prepare communication templates
- [ ] Test maintenance procedures in staging

# 1 hour before maintenance  
- [ ] Send stakeholder notifications
- [ ] Verify team availability
- [ ] Confirm backup completion
- [ ] Set maintenance mode if needed

# During maintenance
- [ ] Follow documented procedures
- [ ] Monitor system health continuously
- [ ] Document any deviations
- [ ] Verify functionality post-change

# Post-maintenance
- [ ] Remove maintenance mode
- [ ] Send completion notifications  
- [ ] Update documentation
- [ ] Schedule retrospective meeting
```

## 📚 Knowledge Base Integration

### Runbook Updates
- All procedures must be tested quarterly
- Updates require peer review and approval
- Version control all runbook changes
- Maintain change log for audit trail

### Training Requirements
- New team members must complete runbook training
- Annual refresher training for all operations staff
- Incident response simulation exercises quarterly
- Cross-training across all procedures

This runbook should be reviewed and updated monthly to ensure accuracy and effectiveness.