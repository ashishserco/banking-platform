# Troubleshooting Guide

## Overview

This guide provides systematic troubleshooting procedures for common issues in the banking platform. It includes diagnostic steps, resolution procedures, and escalation paths.

## 🔍 Systematic Troubleshooting Approach

### Problem Identification Framework
```
1. Gather symptoms and error messages
2. Identify affected services/components  
3. Determine impact scope (users, transactions, time)
4. Check recent changes (deployments, config)
5. Review monitoring data and logs
6. Form hypothesis and test systematically
7. Document findings and resolution
```

## 🚨 Service-Specific Troubleshooting

### Account Service Issues

#### Symptom: Account Service Unresponsive
**Error Indicators:**
- HTTP 5xx responses from /api/account endpoints
- Pod restarts or crash loops
- High response times (>5 seconds)

**Diagnostic Steps:**
```bash
# Check pod status
kubectl get pods -n banking-platform-prod -l app.kubernetes.io/name=account-service

# Check service logs
kubectl logs -f -l app.kubernetes.io/name=account-service -n banking-platform-prod --tail=100

# Check resource usage
kubectl top pods -n banking-platform-prod -l app.kubernetes.io/name=account-service

# Test service endpoints
curl -v https://api.banking-platform.com/api/account/health
```

**Common Causes & Solutions:**

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
     dotnet run --verify-database-connection
   
   # Check connection pool
   # Look for "timeout expired" or "connection pool exhausted" in logs
   
   # Solution: Restart service or scale horizontally
   kubectl rollout restart deployment/banking-platform-prod-account-service -n banking-platform-prod
   ```

2. **Memory/CPU Exhaustion**
   ```bash
   # Check resource limits
   kubectl describe pod <pod-name> -n banking-platform-prod
   
   # Solution: Scale up resources or pods
   kubectl scale deployment banking-platform-prod-account-service --replicas=5 -n banking-platform-prod
   ```

3. **Configuration Issues**
   ```bash
   # Check ConfigMap and Secrets
   kubectl get configmap banking-platform-config -n banking-platform-prod -o yaml
   kubectl get secret banking-platform-secrets -n banking-platform-prod
   ```

### Transaction Service Issues

#### Symptom: Transaction Failures
**Error Indicators:**
- Failed money transfers
- "Transaction timeout" errors
- Database deadlocks in logs

**Diagnostic Steps:**
```bash
# Check transaction service health
kubectl logs -f -l app.kubernetes.io/name=transaction-service -n banking-platform-prod --tail=50

# Check database locks
# SQL query to find blocking transactions:
SELECT blocking_session_id, wait_type, wait_time, wait_resource 
FROM sys.dm_exec_requests WHERE blocking_session_id <> 0;
```

**Common Solutions:**
1. **Database Deadlocks**
   ```sql
   -- Kill blocking sessions (use carefully)
   KILL <session_id>;
   
   -- Check for long-running transactions
   SELECT * FROM sys.dm_exec_sessions WHERE open_transaction_count > 0;
   ```

2. **Service Bus Issues**
   ```bash
   # Check Service Bus metrics
   az servicebus namespace show --name banking-platform-prod-servicebus
   
   # Check message backlog
   az servicebus topic show --name transaction-events --namespace-name banking-platform-prod-servicebus
   ```

### Payment Service Issues

#### Symptom: Payment Processing Failures
**Error Indicators:**
- Payment timeouts
- External gateway errors
- High latency on payment endpoints

**Diagnostic Steps:**
```bash
# Check payment service logs
kubectl logs -f -l app.kubernetes.io/name=payment-service -n banking-platform-prod

# Test external gateway connectivity
kubectl exec -it <payment-pod> -n banking-platform-prod -- \
  curl -v https://external-payment-gateway.com/health

# Check Redis connectivity (for idempotency)
kubectl exec -it <payment-pod> -n banking-platform-prod -- \
  redis-cli -h banking-platform-prod-redis ping
```

## 🌐 Infrastructure Troubleshooting

### Kubernetes Cluster Issues

#### Pod Scheduling Problems
```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod <pod-name> -n banking-platform-prod

# Check resource quotas
kubectl describe resourcequota -n banking-platform-prod

# Common solutions:
# 1. Scale cluster nodes
# 2. Adjust resource requests/limits
# 3. Remove resource constraints
```

#### Network Connectivity Issues
```bash
# Test pod-to-pod connectivity
kubectl exec -it <source-pod> -n banking-platform-prod -- \
  curl <target-service>:<port>/health

# Check DNS resolution
kubectl exec -it <pod> -n banking-platform-prod -- \
  nslookup banking-platform-prod-account-service

# Check Istio configuration
kubectl get virtualservices,destinationrules -n banking-platform-prod
```

### Database Troubleshooting

#### High Database CPU/DTU Usage
```bash
# Check database metrics
az sql db show-usage --name BankingAccountsDb --server banking-platform-prod-sql

# Identify expensive queries
# Use Azure SQL Query Performance Insight
# Or run query store analysis
```

#### Connection Pool Exhaustion
```bash
# Symptoms: "Timeout expired" errors, connection failures

# Check active connections
# Use Azure SQL connection monitoring

# Solutions:
# 1. Increase connection pool size in application
# 2. Scale application horizontally 
# 3. Optimize long-running queries
# 4. Implement connection retry logic
```

## 🔧 Common Resolution Procedures

### Service Recovery

#### Quick Service Restart
```bash
# Restart specific deployment
kubectl rollout restart deployment/<service-name> -n banking-platform-prod

# Wait for rollout to complete
kubectl rollout status deployment/<service-name> -n banking-platform-prod
```

#### Emergency Scaling
```bash
# Scale up pods immediately
kubectl scale deployment <service-name> --replicas=<count> -n banking-platform-prod

# Scale up cluster nodes (if needed)
az aks scale --name banking-platform-prod-aks \
  --node-count <count> \
  --resource-group banking-platform-prod-rg
```

### Traffic Management

#### Redirect Traffic (Istio)
```bash
# Route traffic to healthy services only
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: emergency-routing
spec:
  hosts:
  - api.banking-platform.com
  http:
  - match:
    - uri:
        prefix: "/api/payment"
    route:
    - destination:
        host: backup-payment-service
EOF
```

#### Enable Circuit Breaker
```bash
# Apply circuit breaker configuration
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: account-service-cb
spec:
  host: account-service
  trafficPolicy:
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
EOF
```

## 📊 Performance Troubleshooting

### High Latency Issues

#### Investigation Process
```bash
# 1. Identify bottleneck layer
# Check API gateway metrics
# Check service response times
# Check database query times
# Check network latency

# 2. Application profiling
kubectl exec -it <pod> -n banking-platform-prod -- \
  dotnet-dump collect -p 1

# 3. Database performance analysis
# Use Azure SQL Performance Recommendations
# Check for missing indexes
# Analyze query execution plans
```

### Memory Leaks

#### Detection and Analysis
```bash
# Monitor memory usage over time
kubectl top pods -n banking-platform-prod --sort-by=memory

# Generate memory dump
kubectl exec -it <pod> -n banking-platform-prod -- \
  dotnet-dump collect -p 1 -o /tmp/memory.dump

# Analyze with dotMemory or similar tools
```

## 🔒 Security Incident Troubleshooting

### Suspicious Activity Investigation

#### Log Analysis
```bash
# Search for failed authentication attempts
kubectl logs -n banking-platform-prod | grep "authentication.*failed" | tail -50

# Check for unusual API calls
kubectl logs -n banking-platform-prod | grep -E "POST|PUT|DELETE" | \
  awk '{print $1, $7}' | sort | uniq -c | sort -nr
```

#### Network Security Analysis
```bash
# Check for unusual network connections
kubectl exec -it <pod> -n banking-platform-prod -- netstat -an

# Review Istio access logs
kubectl logs -l app=istio-proxy -n banking-platform-prod
```

## 📞 Escalation Procedures

### When to Escalate

#### Immediate Escalation (Sev 1)
- Complete service outage >15 minutes
- Security breach suspected
- Data corruption detected
- Multiple system failures

#### Standard Escalation (Sev 2/3)
- Troubleshooting exceeds 1 hour
- Requires code changes
- External vendor involvement needed
- Root cause unclear after investigation

### Escalation Contacts
```yaml
Level 1 (Operations):
  - Primary: +1-555-0101
  - Secondary: +1-555-0102

Level 2 (Engineering):
  - Platform Team: +1-555-0201
  - Database Team: +1-555-0202
  - Security Team: +1-555-0203

Level 3 (Management):
  - Engineering Manager: +1-555-0301
  - CTO: +1-555-0302

External:
  - Azure Support: Portal case
  - Vendor Support: See vendor contacts
```

## 📋 Troubleshooting Checklist

### Pre-Investigation
- [ ] Gather all error messages and symptoms
- [ ] Identify time of issue onset
- [ ] Determine user impact scope
- [ ] Check for recent changes
- [ ] Document initial findings

### During Investigation  
- [ ] Follow systematic approach
- [ ] Document all steps taken
- [ ] Test hypotheses methodically
- [ ] Involve subject matter experts
- [ ] Keep stakeholders informed

### Post-Resolution
- [ ] Verify complete resolution
- [ ] Document root cause
- [ ] Update monitoring/alerts
- [ ] Plan preventive measures
- [ ] Conduct lessons learned session

This troubleshooting guide should be continuously updated based on new issues and resolutions discovered in production.