# Deployment Procedures Runbook

## Overview

This runbook provides comprehensive procedures for deploying applications to the banking platform. It covers deployment planning, execution, verification, and rollback procedures for all environments.

## 🎯 Deployment Strategy Overview

### Deployment Types

#### Rolling Deployment
**Use Case**: Development and staging environments
**Description**: Gradual replacement of old instances with new ones
**Risk**: Medium - potential for temporary inconsistency
**Rollback Time**: 2-5 minutes

#### Blue-Green Deployment
**Use Case**: Production environment for critical services
**Description**: Deploy to parallel environment, then switch traffic
**Risk**: Low - complete environment validation before switch
**Rollback Time**: <30 seconds (traffic switch)

#### Canary Deployment
**Use Case**: Production for gradual rollout
**Description**: Deploy to subset of users, gradually increase
**Risk**: Low - limited blast radius
**Rollback Time**: <1 minute

### Environment Promotion Flow
```
Development → Staging → Production
    ↓           ↓         ↓
 Auto Deploy  Manual    Manual + Approval
              Deploy    + Security Review
```

## 📋 Pre-Deployment Checklist

### Code Readiness (Required for all environments)
- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Security scans completed (no critical vulnerabilities)
- [ ] Code review completed and approved
- [ ] Documentation updated
- [ ] Database migrations tested (if applicable)

### Environment-Specific Checks

#### Development Environment
- [ ] Feature branch merged to develop
- [ ] CI pipeline passing
- [ ] No blocking dependencies

#### Staging Environment  
- [ ] QA testing completed
- [ ] Performance testing passed
- [ ] Integration testing with external services
- [ ] Security testing completed
- [ ] Business stakeholder approval

#### Production Environment
- [ ] Staging deployment successful and verified
- [ ] Change management approval (CAB)
- [ ] Deployment window scheduled
- [ ] Rollback plan documented and tested
- [ ] Communication plan ready
- [ ] On-call team notified
- [ ] Database backup completed
- [ ] Emergency contact list updated

## 🚀 Deployment Execution

### Development Deployment

#### Automated Deployment (CI/CD)
```bash
# Triggered automatically on develop branch push
# Pipeline handles:
# 1. Build and test
# 2. Container image creation
# 3. Helm deployment
# 4. Health verification
```

#### Manual Deployment (if needed)
```bash
# 1. Build and push images
./pipelines/scripts/build.sh $(git rev-parse --short HEAD) bankingplatformacr.azurecr.io true

# 2. Deploy to development
./pipelines/scripts/deploy.sh dev deploy $(git rev-parse --short HEAD)

# 3. Verify deployment
./pipelines/scripts/deploy.sh dev health
```

### Staging Deployment

#### Pre-Deployment Setup
```bash
# 1. Verify staging environment readiness
kubectl get nodes -o wide
kubectl get pods --all-namespaces | grep -v Running
kubectl top nodes

# 2. Create deployment backup
./pipelines/scripts/deploy.sh staging backup

# 3. Verify database connectivity
kubectl exec -n banking-platform-staging deployment/banking-platform-staging-account-service -- \
  dotnet ef database ensure-created
```

#### Deployment Process
```bash
# 1. Set maintenance mode (if required)
kubectl patch ingress banking-platform-staging -n banking-platform-staging -p \
  '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/default-backend":"maintenance-service"}}}'

# 2. Deploy new version
helm upgrade banking-platform-staging ./helm/banking-platform \
  --namespace banking-platform-staging \
  --set global.image.tag=$(BUILD_ID) \
  --set global.environment=staging \
  --values helm/banking-platform/values-staging.yaml \
  --wait \
  --timeout=900s

# 3. Run database migrations
kubectl exec -n banking-platform-staging deployment/banking-platform-staging-account-service -- \
  dotnet ef database update

# 4. Verify deployment
./pipelines/scripts/deploy.sh staging health

# 5. Remove maintenance mode
kubectl patch ingress banking-platform-staging -n banking-platform-staging -p \
  '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/default-backend":null}}}'
```

#### Post-Deployment Verification
```bash
# 1. Functional testing
newman run tests/api/banking-platform.postman_collection.json \
  --environment tests/api/staging-environment.json

# 2. Performance baseline check
kubectl top pods -n banking-platform-staging
curl -w "@curl-format.txt" -o /dev/null -s "https://staging.banking-platform.com/api/account/health"

# 3. Security verification
nmap -sS staging.banking-platform.com
```

### Production Deployment

#### Pre-Deployment (T-1 hour)

1. **Final Verification**
   ```bash
   # Verify staging deployment stability (24+ hours)
   ./pipelines/scripts/deploy.sh staging status
   
   # Check for any ongoing incidents
   kubectl get events --sort-by='.lastTimestamp' -n banking-platform-staging
   ```

2. **Team Preparation**
   ```bash
   # Notify operations team
   # Confirm incident response team availability
   # Verify emergency contact accessibility
   ```

3. **Infrastructure Readiness**
   ```bash
   # Check cluster health
   kubectl get nodes -o wide
   kubectl top nodes
   
   # Verify backup completion
   az sql db list-backups --server banking-platform-prod-sql
   
   # Check Azure service health
   az monitor activity-log list --resource-group banking-platform-prod-rg --max-events 5
   ```

#### Blue-Green Deployment Process

1. **Prepare Green Environment**
   ```bash
   # Clone current production configuration
   helm get values banking-platform-prod -n banking-platform-prod > current-values.yaml
   
   # Deploy to green environment (parallel namespace)
   helm upgrade banking-platform-green ./helm/banking-platform \
     --namespace banking-platform-green \
     --create-namespace \
     --set global.image.tag=$(BUILD_ID) \
     --set global.environment=production \
     --set deployment.color=green \
     --values current-values.yaml \
     --wait \
     --timeout=1200s
   ```

2. **Green Environment Testing**
   ```bash
   # Internal health checks
   kubectl exec -n banking-platform-green deployment/banking-platform-green-account-service -- \
     curl localhost:80/health
   
   # Database connectivity test
   kubectl exec -n banking-platform-green deployment/banking-platform-green-account-service -- \
     dotnet run --verify-database-connection
   
   # Limited traffic testing (internal)
   curl -H "X-Environment: green" https://api.banking-platform.com/api/account/health
   ```

3. **Traffic Switch (Blue to Green)**
   ```bash
   # Update Istio virtual service to point to green
   kubectl apply -f - <<EOF
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: banking-platform-production
     namespace: banking-platform-prod
   spec:
     hosts:
     - api.banking-platform.com
     http:
     - route:
       - destination:
           host: banking-platform-green-api-gateway
           port:
             number: 80
         weight: 100
   EOF
   ```

4. **Post-Switch Verification**
   ```bash
   # Monitor for 10 minutes after traffic switch
   watch -n 30 'kubectl top pods -n banking-platform-green'
   
   # Check error rates
   curl -s https://api.banking-platform.com/metrics | grep error_rate
   
   # Verify all services responding
   for service in account transaction payment notification; do
     curl -f https://api.banking-platform.com/api/$service/health
   done
   ```

5. **Blue Environment Cleanup (T+24 hours)**
   ```bash
   # After 24 hours of stable green deployment
   helm uninstall banking-platform-prod -n banking-platform-prod
   kubectl delete namespace banking-platform-prod
   
   # Rename green to production
   kubectl create namespace banking-platform-prod
   helm upgrade banking-platform-prod ./helm/banking-platform \
     --namespace banking-platform-prod \
     --reuse-values \
     --set deployment.color=production
   ```

## 🔄 Database Migration Procedures

### Migration Planning

#### Schema Changes
```sql
-- Use backward-compatible changes when possible
-- Example: Adding nullable columns
ALTER TABLE Accounts ADD COLUMN LastLoginDate DATETIME2 NULL;

-- For breaking changes, use multi-phase deployment
-- Phase 1: Add new column alongside old
-- Phase 2: Migrate data
-- Phase 3: Remove old column (next release)
```

#### Data Migration Strategy
```bash
# Large data migrations should be done offline during maintenance windows
# Use chunked processing for large datasets
# Implement progress monitoring and rollback capabilities
```

### Migration Execution

#### Pre-Migration Backup
```bash
# Create point-in-time backup before migration
az sql db copy --dest-name banking-backup-$(date +%Y%m%d-%H%M%S) \
  --dest-server banking-platform-prod-sql \
  --name BankingAccountsDb \
  --server banking-platform-prod-sql
```

#### Migration Execution
```bash
# 1. Run migration script with transaction
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
  dotnet ef database update --no-build --verbose

# 2. Verify migration success
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
  dotnet ef migrations list

# 3. Test application functionality
curl -f https://api.banking-platform.com/api/account/health
```

#### Migration Rollback (if needed)
```bash
# Option 1: Rollback to previous migration
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
  dotnet ef database update <previous-migration-name>

# Option 2: Restore from backup (for data corruption)
az sql db restore --dest-name BankingAccountsDb-restore \
  --server banking-platform-prod-sql \
  --source-database banking-backup-YYYYMMDD-HHMMSS \
  --time "2023-XX-XXTXX:XX:XX"
```

## 🔙 Rollback Procedures

### Rollback Decision Matrix

| Issue Type | Time Since Deploy | Rollback Method | ETA |
|------------|-------------------|-----------------|-----|
| Health Check Failure | <30 min | Helm rollback | 2 min |
| Performance Degradation | <2 hours | Helm rollback | 3 min |
| Data Corruption | Any time | Database restore | 15-30 min |
| Security Issue | Any time | Immediate rollback | 1 min |

### Application Rollback

#### Helm Rollback (Preferred)
```bash
# 1. Check rollback options
helm history banking-platform-prod -n banking-platform-prod

# 2. Rollback to previous version
helm rollback banking-platform-prod <revision-number> -n banking-platform-prod --wait

# 3. Verify rollback success
kubectl get pods -n banking-platform-prod
./pipelines/scripts/deploy.sh prod health
```

#### Blue-Green Traffic Switch Rollback
```bash
# Emergency traffic switch back to blue environment
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: banking-platform-production
  namespace: banking-platform-prod
spec:
  hosts:
  - api.banking-platform.com
  http:
  - route:
    - destination:
        host: banking-platform-prod-api-gateway
        port:
          number: 80
      weight: 100
EOF
```

### Database Rollback

#### Migration Rollback
```bash
# Rollback to previous migration (if schema compatible)
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
  dotnet ef database update <previous-migration>

# Verify rollback
kubectl exec -n banking-platform-prod deployment/banking-platform-prod-account-service -- \
  dotnet ef migrations list
```

#### Point-in-Time Restore
```bash
# For data corruption or irreversible changes
# 1. Create new database from backup
az sql db restore --dest-name BankingAccountsDb-restore \
  --server banking-platform-prod-sql \
  --source-database BankingAccountsDb \
  --time "2023-XX-XXTXX:XX:XX"

# 2. Update connection strings
kubectl patch secret banking-platform-secrets -n banking-platform-prod -p \
  '{"data":{"ConnectionString":"<new-encoded-connection-string>"}}'

# 3. Restart applications
kubectl rollout restart deployment -n banking-platform-prod
```

## 📊 Deployment Monitoring

### Deployment Health Metrics

#### Application Metrics
```bash
# Response time monitoring
curl -w "@curl-format.txt" -o /dev/null -s "https://api.banking-platform.com/api/account/health"

# Error rate monitoring
kubectl logs -n banking-platform-prod deployment/banking-platform-prod-account-service | grep ERROR | wc -l

# Throughput monitoring
kubectl top pods -n banking-platform-prod
```

#### Infrastructure Metrics
```bash
# Resource utilization
kubectl top nodes
kubectl top pods -n banking-platform-prod

# Pod status
kubectl get pods -n banking-platform-prod -o wide
```

#### Business Metrics
```bash
# Transaction success rate
# API call success rate
# User authentication success rate
# Database query performance
```

### Automated Monitoring

#### Health Check Automation
```bash
#!/bin/bash
# post_deployment_monitoring.sh

ENVIRONMENT=$1
DURATION=${2:-1800}  # 30 minutes default
INTERVAL=${3:-30}    # 30 seconds default

echo "Starting post-deployment monitoring for $ENVIRONMENT"
echo "Duration: ${DURATION}s, Interval: ${INTERVAL}s"

end_time=$(($(date +%s) + DURATION))

while [ $(date +%s) -lt $end_time ]; do
    # Check all services
    for service in account transaction payment notification; do
        status_code=$(curl -s -o /dev/null -w "%{http_code}" \
          https://api.banking-platform.com/api/$service/health)
        
        if [ "$status_code" != "200" ]; then
            echo "❌ $service health check failed (HTTP $status_code)"
            exit 1
        else
            echo "✅ $service healthy"
        fi
    done
    
    # Check error rates
    error_rate=$(kubectl logs -n banking-platform-$ENVIRONMENT \
      deployment/banking-platform-$ENVIRONMENT-account-service --since=1m | \
      grep ERROR | wc -l)
    
    if [ "$error_rate" -gt 5 ]; then
        echo "❌ High error rate detected: $error_rate errors/minute"
        exit 1
    fi
    
    echo "📊 Error rate: $error_rate/minute - OK"
    sleep $INTERVAL
done

echo "✅ Post-deployment monitoring completed successfully"
```

## 📝 Deployment Documentation

### Deployment Record Template
```markdown
# Deployment Record: [DATE] - [BUILD_ID]

## Summary
- **Environment**: Production
- **Build ID**: 
- **Deployment Time**: 
- **Deployer**: 
- **Deployment Type**: Blue-Green

## Changes Included
- [ ] Feature: Account balance caching
- [ ] Bugfix: Transaction timeout handling
- [ ] Security: Updated authentication library

## Pre-Deployment Verification
- [ ] Staging tests passed
- [ ] Security scan completed
- [ ] Performance tests passed
- [ ] Database backup completed

## Deployment Execution
- **Start Time**: 
- **End Time**: 
- **Duration**: 
- **Issues Encountered**: None / [Description]

## Post-Deployment Verification
- [ ] All services healthy
- [ ] Database connectivity verified
- [ ] Performance within acceptable range
- [ ] Error rates normal

## Rollback Plan
- **Rollback Trigger**: Health check failure > 5 minutes
- **Rollback Method**: Helm rollback to revision X
- **Rollback Owner**: [Name]

## Sign-off
- **Technical Lead**: [Name] - [Timestamp]
- **Operations Lead**: [Name] - [Timestamp]
```

### Change Management Integration

#### Change Request Requirements
- Impact assessment completed
- Risk analysis documented
- Rollback plan verified
- Communication plan approved
- Emergency contacts updated

#### Approval Process
```
1. Technical Review → Platform Engineering Team
2. Security Review → Security Team (for security changes)
3. Business Review → Product Team (for feature changes)
4. Operations Review → Operations Team
5. Final Approval → Change Advisory Board
```

## 🎯 Best Practices

### Deployment Timing
- **Preferred Windows**: Tuesday-Thursday, 10 AM - 2 PM PST
- **Avoid**: Mondays, Fridays, end/start of month, holidays
- **Emergency Deployments**: Any time with management approval

### Risk Mitigation
- Always test deployment process in staging first
- Implement feature flags for new functionality
- Use database migration scripts with rollback capability
- Maintain current documentation and runbooks
- Keep emergency contact list updated

### Continuous Improvement
- Regular deployment retrospectives
- Automation of manual steps
- Performance metrics tracking
- Process documentation updates
- Team training and knowledge sharing

This runbook should be updated after each deployment to incorporate lessons learned and process improvements.