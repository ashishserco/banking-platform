# Backup and Recovery Runbook

## Overview

This runbook provides comprehensive procedures for backing up and recovering the banking platform. It covers database backups, application state, configuration backup, and disaster recovery procedures.

## 💾 Backup Strategy

### Backup Types

#### Database Backups
- **Full Backup**: Complete database backup (Daily at 2 AM UTC)
- **Differential Backup**: Changes since last full backup (Every 6 hours)
- **Transaction Log Backup**: Continuous (Every 5 minutes)
- **Point-in-Time Recovery**: Available for last 35 days

#### Application Backups
- **Container Images**: Stored in Azure Container Registry with retention
- **Configuration**: Kubernetes manifests, Helm values, secrets
- **Application State**: Persistent volume snapshots

#### Infrastructure Backups
- **Terraform State**: Backed up to Azure Storage with versioning
- **Kubernetes Cluster State**: ETCD backups via AKS
- **Certificates**: SSL/TLS certificates and keys

### Retention Policy

| Backup Type | Retention Period | Storage Location |
|-------------|------------------|------------------|
| Database Full | 90 days | Azure Blob Storage (GRS) |
| Database Transaction Log | 35 days | Azure Blob Storage |
| Container Images | 30 days | Azure Container Registry |
| Configuration | 1 year | Git repository + Azure Storage |
| Infrastructure State | 1 year | Azure Storage (versioned) |

## 🗄️ Database Backup Procedures

### Automated Backup Verification

#### Daily Backup Verification Script
```bash
#!/bin/bash
# verify_database_backups.sh

echo "🔍 Verifying Database Backups"
echo "============================="

# Check latest backup for each database
databases=("BankingAccountsDb" "BankingTransactionsDb" "BankingPaymentsDb" "BankingNotificationsDb")

for db in "${databases[@]}"; do
    echo "Checking $db..."
    
    # Get latest backup information
    latest_backup=$(az sql db list-backups \
        --server banking-platform-prod-sql \
        --database $db \
        --query '[0].{BackupTime:earliestRestoreDate, Type:backupStorageRedundancy}' \
        --output table)
    
    echo "$latest_backup"
    
    # Check if backup is less than 25 hours old
    backup_age=$(az sql db list-backups \
        --server banking-platform-prod-sql \
        --database $db \
        --query '[0].earliestRestoreDate' \
        --output tsv)
    
    if [[ -n "$backup_age" ]]; then
        echo "✅ $db: Latest backup verified"
    else
        echo "❌ $db: No recent backup found"
        exit 1
    fi
done

echo "✅ All database backups verified"
```

### Manual Database Backup

#### Create On-Demand Backup
```bash
# Create immediate backup copy
az sql db copy \
    --dest-name "BankingAccountsDb-manual-$(date +%Y%m%d-%H%M%S)" \
    --dest-server banking-platform-prod-sql \
    --name BankingAccountsDb \
    --server banking-platform-prod-sql \
    --resource-group banking-platform-prod-rg

# Export to blob storage (for compliance)
az sql db export \
    --name BankingAccountsDb \
    --server banking-platform-prod-sql \
    --admin-user $SQL_ADMIN_USER \
    --admin-password $SQL_ADMIN_PASSWORD \
    --storage-key $STORAGE_KEY \
    --storage-key-type StorageAccessKey \
    --storage-uri https://bankingbackups.blob.core.windows.net/database-exports/accounts-$(date +%Y%m%d).bacpac
```

### Database Backup Testing

#### Monthly Backup Restore Test
```bash
#!/bin/bash
# test_backup_restore.sh

echo "🧪 Testing Database Backup Restore"
echo "=================================="

# Create test server for restore validation
az sql server create \
    --name banking-test-restore-$(date +%Y%m%d) \
    --resource-group banking-platform-test-rg \
    --location eastus \
    --admin-user testadmin \
    --admin-password "TestPassword123!"

# Restore latest backup to test server
az sql db restore \
    --dest-name BankingAccountsDb-test \
    --server banking-test-restore-$(date +%Y%m%d) \
    --name BankingAccountsDb \
    --source-server banking-platform-prod-sql \
    --time "$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S')"

# Verify restore integrity
echo "Verifying restored data integrity..."

# Run data validation queries
RESTORE_CONNECTION_STRING="Server=banking-test-restore-$(date +%Y%m%d).database.windows.net;Database=BankingAccountsDb-test;User Id=testadmin;Password=TestPassword123!;"

# Validate row counts match expectations
sqlcmd -S banking-test-restore-$(date +%Y%m%d).database.windows.net \
    -d BankingAccountsDb-test \
    -U testadmin \
    -P "TestPassword123!" \
    -Q "SELECT 'Accounts', COUNT(*) FROM Accounts UNION ALL SELECT 'Customers', COUNT(*) FROM Customers"

echo "✅ Backup restore test completed"

# Cleanup test resources
az sql server delete \
    --name banking-test-restore-$(date +%Y%m%d) \
    --resource-group banking-platform-test-rg \
    --yes
```

## 🔧 Application Backup Procedures

### Configuration Backup

#### Kubernetes Configuration Backup
```bash
#!/bin/bash
# backup_kubernetes_config.sh

BACKUP_DIR="/backup/kubernetes/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up Kubernetes Configuration"

# Backup all ConfigMaps
kubectl get configmaps -n banking-platform-prod -o yaml > "$BACKUP_DIR/configmaps.yaml"

# Backup Secrets (encrypted)
kubectl get secrets -n banking-platform-prod -o yaml > "$BACKUP_DIR/secrets.yaml"

# Backup Service configurations
kubectl get services -n banking-platform-prod -o yaml > "$BACKUP_DIR/services.yaml"

# Backup Ingress configurations
kubectl get ingress -n banking-platform-prod -o yaml > "$BACKUP_DIR/ingress.yaml"

# Backup Helm values
helm get values banking-platform-prod -n banking-platform-prod > "$BACKUP_DIR/helm-values.yaml"

# Backup Istio configurations
kubectl get virtualservices,destinationrules,gateways -n banking-platform-prod -o yaml > "$BACKUP_DIR/istio-config.yaml"

# Compress and upload to Azure Storage
tar -czf "$BACKUP_DIR.tar.gz" -C /backup/kubernetes "$(date +%Y%m%d)"

az storage blob upload \
    --file "$BACKUP_DIR.tar.gz" \
    --name "kubernetes-config/$(date +%Y%m%d)-kubernetes-config.tar.gz" \
    --container-name backups \
    --account-name bankingplatformbackups

echo "✅ Kubernetes configuration backed up"
```

#### Application State Backup
```bash
#!/bin/bash
# backup_application_state.sh

echo "💿 Backing up Application State"

# Backup persistent volumes
kubectl get pv,pvc -n banking-platform-prod -o yaml > "/backup/volumes-$(date +%Y%m%d).yaml"

# Create volume snapshots (if using Azure Disks)
for pvc in $(kubectl get pvc -n banking-platform-prod -o jsonpath='{.items[*].metadata.name}'); do
    az snapshot create \
        --name "${pvc}-snapshot-$(date +%Y%m%d)" \
        --source "/subscriptions/SUBSCRIPTION_ID/resourceGroups/MC_banking-platform-prod-rg_banking-platform-prod-aks_eastus/providers/Microsoft.Compute/disks/${pvc}" \
        --resource-group banking-platform-prod-rg
done

echo "✅ Application state backed up"
```

## 🔄 Recovery Procedures

### Database Recovery

#### Point-in-Time Recovery
```bash
#!/bin/bash
# database_point_in_time_recovery.sh

TARGET_TIME="$1"  # Format: 2023-12-01T10:30:00
DATABASE_NAME="$2"
RESTORE_DATABASE_NAME="${DATABASE_NAME}-restore-$(date +%Y%m%d-%H%M%S)"

if [[ -z "$TARGET_TIME" || -z "$DATABASE_NAME" ]]; then
    echo "Usage: $0 <target_time> <database_name>"
    echo "Example: $0 '2023-12-01T10:30:00' 'BankingAccountsDb'"
    exit 1
fi

echo "🔄 Starting Point-in-Time Recovery"
echo "Target Time: $TARGET_TIME"
echo "Database: $DATABASE_NAME"
echo "Restore Name: $RESTORE_DATABASE_NAME"

# Create restored database
az sql db restore \
    --dest-name "$RESTORE_DATABASE_NAME" \
    --server banking-platform-prod-sql \
    --name "$DATABASE_NAME" \
    --time "$TARGET_TIME" \
    --resource-group banking-platform-prod-rg

# Wait for restore completion
echo "⏳ Waiting for restore to complete..."
while true; do
    status=$(az sql db show \
        --name "$RESTORE_DATABASE_NAME" \
        --server banking-platform-prod-sql \
        --resource-group banking-platform-prod-rg \
        --query "status" -o tsv)
    
    if [[ "$status" == "Online" ]]; then
        echo "✅ Database restore completed"
        break
    else
        echo "Status: $status - waiting..."
        sleep 30
    fi
done

# Verify data integrity
echo "🔍 Verifying restored data integrity..."

# Run basic validation queries
sqlcmd -S banking-platform-prod-sql.database.windows.net \
    -d "$RESTORE_DATABASE_NAME" \
    -U "$SQL_ADMIN_USER" \
    -P "$SQL_ADMIN_PASSWORD" \
    -Q "SELECT COUNT(*) as TotalAccounts FROM Accounts; SELECT COUNT(*) as TotalTransactions FROM Transactions WHERE CreatedAt <= '$TARGET_TIME';"

echo "✅ Point-in-time recovery completed: $RESTORE_DATABASE_NAME"
```

#### Database Failover Procedure
```bash
#!/bin/bash
# database_failover.sh

echo "🔄 Initiating Database Failover"

# 1. Check current primary
current_primary=$(az sql db show \
    --name BankingAccountsDb \
    --server banking-platform-prod-sql \
    --query "currentServiceObjectiveName" -o tsv)

echo "Current configuration: $current_primary"

# 2. Switch to secondary (if geo-replication configured)
if [[ -n "$SECONDARY_SERVER" ]]; then
    echo "Initiating failover to secondary server: $SECONDARY_SERVER"
    
    az sql db replica set-primary \
        --name BankingAccountsDb \
        --server "$SECONDARY_SERVER" \
        --resource-group banking-platform-prod-rg
        
    # Update application connection strings
    kubectl patch secret banking-platform-secrets -n banking-platform-prod -p \
        '{"data":{"ConnectionString":"'$(echo -n "$SECONDARY_CONNECTION_STRING" | base64)'"}}'
    
    # Restart applications to pick up new connection string
    kubectl rollout restart deployment -n banking-platform-prod
else
    echo "⚠️  No secondary server configured - manual intervention required"
fi
```

### Application Recovery

#### Service Recovery from Backup
```bash
#!/bin/bash
# recover_application_from_backup.sh

BACKUP_DATE="$1"
TARGET_ENVIRONMENT="${2:-banking-platform-recovery}"

if [[ -z "$BACKUP_DATE" ]]; then
    echo "Usage: $0 <backup_date> [target_environment]"
    echo "Example: $0 20231201 banking-platform-recovery"
    exit 1
fi

echo "🔄 Starting Application Recovery"
echo "Backup Date: $BACKUP_DATE"
echo "Target Environment: $TARGET_ENVIRONMENT"

# 1. Create recovery namespace
kubectl create namespace "$TARGET_ENVIRONMENT" --dry-run=client -o yaml | kubectl apply -f -

# 2. Download and extract configuration backup
az storage blob download \
    --name "kubernetes-config/$BACKUP_DATE-kubernetes-config.tar.gz" \
    --container-name backups \
    --account-name bankingplatformbackups \
    --file "/tmp/$BACKUP_DATE-config.tar.gz"

tar -xzf "/tmp/$BACKUP_DATE-config.tar.gz" -C /tmp

# 3. Restore configurations
kubectl apply -f "/tmp/$BACKUP_DATE/configmaps.yaml" -n "$TARGET_ENVIRONMENT"
kubectl apply -f "/tmp/$BACKUP_DATE/secrets.yaml" -n "$TARGET_ENVIRONMENT"
kubectl apply -f "/tmp/$BACKUP_DATE/services.yaml" -n "$TARGET_ENVIRONMENT"

# 4. Deploy application using backup Helm values
helm install "$TARGET_ENVIRONMENT" ./helm/banking-platform \
    --namespace "$TARGET_ENVIRONMENT" \
    --values "/tmp/$BACKUP_DATE/helm-values.yaml"

# 5. Verify recovery
kubectl wait --for=condition=available --timeout=300s \
    deployment -l app.kubernetes.io/instance="$TARGET_ENVIRONMENT" \
    -n "$TARGET_ENVIRONMENT"

echo "✅ Application recovery completed"
```

## 🚨 Disaster Recovery Procedures

### Complete System Recovery

#### Disaster Recovery Activation
```bash
#!/bin/bash
# activate_disaster_recovery.sh

echo "🚨 ACTIVATING DISASTER RECOVERY"
echo "==============================="

# 1. Assess damage and scope
echo "Step 1: Damage Assessment"
read -p "Confirm primary site is completely unavailable (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
    echo "❌ Disaster recovery activation cancelled"
    exit 1
fi

# 2. Activate secondary region
echo "Step 2: Activating Secondary Region"

# Switch to secondary Azure region
export AZURE_REGION="West US 2"
export RESOURCE_GROUP="banking-platform-dr-rg"
export AKS_CLUSTER="banking-platform-dr-aks"

# 3. Restore databases in DR region
echo "Step 3: Database Recovery"
for db in "BankingAccountsDb" "BankingTransactionsDb" "BankingPaymentsDb" "BankingNotificationsDb"; do
    echo "Restoring $db in DR region..."
    
    # Restore from geo-replicated backup
    az sql db geo-restore \
        --dest-name "$db" \
        --dest-server "banking-platform-dr-sql" \
        --source-database "$db" \
        --source-server "banking-platform-prod-sql" \
        --resource-group "$RESOURCE_GROUP"
done

# 4. Deploy applications to DR cluster
echo "Step 4: Application Deployment"
kubectl config use-context "$AKS_CLUSTER"

# Deploy from latest known good configuration
helm install banking-platform-dr ./helm/banking-platform \
    --namespace banking-platform-dr \
    --values helm/banking-platform/values-dr.yaml \
    --wait \
    --timeout=1200s

# 5. Update DNS to point to DR site
echo "Step 5: DNS Failover"
# Update Azure DNS or external DNS provider
az network dns record-set a update \
    --name "api" \
    --zone-name "banking-platform.com" \
    --resource-group "$RESOURCE_GROUP" \
    --set "aRecords[0].ipv4Address=$(kubectl get svc banking-platform-dr-api-gateway -n banking-platform-dr -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"

# 6. Verify DR site functionality
echo "Step 6: Verification"
sleep 60  # Wait for DNS propagation

for service in account transaction payment notification; do
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://api.banking-platform.com/api/$service/health")
    
    if [[ "$response" == "200" ]]; then
        echo "✅ $service: Healthy in DR site"
    else
        echo "❌ $service: Issues in DR site ($response)"
    fi
done

echo "🚨 DISASTER RECOVERY ACTIVATION COMPLETED"
echo "Primary site: OFFLINE"
echo "DR site: ACTIVE"
echo "Notify all stakeholders and customers"
```

### Recovery Testing

#### Quarterly DR Test
```bash
#!/bin/bash
# quarterly_dr_test.sh

echo "🧪 Quarterly Disaster Recovery Test"
echo "==================================="

# 1. Create isolated test environment
TEST_NAMESPACE="dr-test-$(date +%Y%m%d)"
kubectl create namespace "$TEST_NAMESPACE"

# 2. Deploy to test environment using DR procedures
helm install "dr-test" ./helm/banking-platform \
    --namespace "$TEST_NAMESPACE" \
    --values helm/banking-platform/values-dr.yaml \
    --set global.environment=dr-test

# 3. Test database recovery
echo "Testing database recovery..."
# Use test database restore procedures

# 4. Run comprehensive tests
echo "Running DR functionality tests..."
newman run tests/api/banking-platform.postman_collection.json \
    --environment tests/api/dr-test-environment.json \
    --reporters cli

# 5. Document test results
echo "Documenting test results..."
# Generate test report

# 6. Cleanup test environment
kubectl delete namespace "$TEST_NAMESPACE"

echo "✅ DR test completed - see test report for details"
```

## 📊 Backup Monitoring

### Backup Health Dashboard

#### Key Metrics to Monitor
- Backup completion status (success/failure)
- Backup duration trends
- Backup size trends  
- Recovery point objective (RPO) compliance
- Recovery time objective (RTO) compliance
- Storage utilization and costs

#### Automated Backup Alerts
```yaml
# Example alert rules for backup monitoring
backup_failure_alert:
  condition: database_backup_failed
  severity: critical
  notification: platform-team@banking-platform.com

backup_age_alert:
  condition: latest_backup_age > 25_hours
  severity: warning
  notification: operations-team@banking-platform.com

backup_size_anomaly:
  condition: backup_size_change > 50%
  severity: warning
  notification: database-team@banking-platform.com
```

This backup and recovery runbook should be tested regularly through scheduled DR exercises and updated based on lessons learned.