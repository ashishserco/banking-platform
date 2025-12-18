# Banking Platform Helm Charts

This directory contains Helm charts for deploying the Banking Platform on Kubernetes.

## Quick Start

### Prerequisites

1. **Kubernetes cluster** (1.19+ recommended)
2. **Helm 3.x** installed
3. **kubectl** configured to access your cluster
4. At least **8GB RAM** and **4 CPU cores** available in your cluster

### Deploy the Platform

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to development environment
./deploy.sh development banking-platform install-or-upgrade

# Or use Helm directly
helm install banking-platform ./banking-platform --namespace banking-platform --create-namespace
```

## Chart Structure

```
banking-platform/
├── Chart.yaml                 # Chart metadata and dependencies
├── values.yaml                # Default configuration values
├── values-production.yaml     # Production-specific values
├── values-staging.yaml        # Staging-specific values
└── templates/
    ├── _helpers.tpl           # Template helpers
    ├── account-service.yaml   # Account Service deployment
    ├── transaction-service.yaml # Transaction Service deployment
    ├── payment-service.yaml   # Payment Service deployment
    ├── notification-service.yaml # Notification Service deployment
    ├── frontend.yaml          # React frontend deployment
    ├── api-gateway.yaml       # Nginx API Gateway deployment
    ├── configmap.yaml         # Configuration maps
    ├── secrets.yaml           # Secrets management
    ├── ingress.yaml           # Ingress configuration
    ├── servicemonitor.yaml    # Prometheus monitoring
    ├── pod-disruption-budget.yaml # PDB for high availability
    └── NOTES.txt             # Post-deployment information
```

## Configuration

### Environment-Specific Values

Create environment-specific values files:

**values-production.yaml**
```yaml
replicaCount: 3

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 50

ingress:
  enabled: true
  hosts:
    - host: banking.yourdomain.com

resources:
  accountService:
    requests:
      cpu: 2000m
      memory: 4Gi
    limits:
      cpu: 4000m
      memory: 8Gi
```

**values-staging.yaml**
```yaml
replicaCount: 2

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10

ingress:
  enabled: true
  hosts:
    - host: banking-staging.yourdomain.com
```

### Key Configuration Areas

#### Database Configuration
```yaml
config:
  database:
    host: "your-database-host"
    username: "banking_user"
    password: "secure_password"
```

#### External Services
```yaml
config:
  services:
    sendGrid:
      apiKey: "your-sendgrid-api-key"
      fromEmail: "noreply@yourdomain.com"
    twilio:
      accountSid: "your-twilio-sid"
      authToken: "your-twilio-token"
```

#### Security
```yaml
config:
  jwt:
    secretKey: "your-super-secure-jwt-key"
    issuer: "your-banking-platform"
    audience: "your-banking-clients"
```

## Deployment Commands

### Install New Release
```bash
helm install banking-platform ./banking-platform \
  --namespace banking-platform \
  --create-namespace \
  --values values-production.yaml
```

### Upgrade Existing Release
```bash
helm upgrade banking-platform ./banking-platform \
  --namespace banking-platform \
  --values values-production.yaml
```

### Install or Upgrade (Recommended)
```bash
helm upgrade --install banking-platform ./banking-platform \
  --namespace banking-platform \
  --create-namespace \
  --values values-production.yaml
```

### Rollback to Previous Version
```bash
helm rollback banking-platform 1 --namespace banking-platform
```

### Uninstall
```bash
helm uninstall banking-platform --namespace banking-platform
```

## Monitoring and Operations

### Health Checks
```bash
# Check pod status
kubectl get pods -n banking-platform

# Check service status
kubectl get svc -n banking-platform

# Check ingress status
kubectl get ingress -n banking-platform
```

### Logs
```bash
# View logs for specific service
kubectl logs -f deployment/banking-platform-account-service -n banking-platform

# View logs for all services
kubectl logs -f -l app.kubernetes.io/instance=banking-platform -n banking-platform
```

### Scaling
```bash
# Scale specific service
kubectl scale deployment banking-platform-account-service --replicas=5 -n banking-platform

# Update HPA settings
kubectl patch hpa banking-platform-account-service -n banking-platform -p '{"spec":{"maxReplicas":20}}'
```

## Dependencies

The chart includes optional dependencies that can be enabled/disabled:

### PostgreSQL
```yaml
postgresql:
  enabled: true
  auth:
    username: "banking"
    password: "secure_password"
    database: "banking"
```

### Redis
```yaml
redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 8Gi
```

### Monitoring Stack
```yaml
prometheus:
  enabled: true
grafana:
  enabled: true
  adminPassword: "admin"
elasticsearch:
  enabled: true
```

## Security Considerations

### Production Checklist

- [ ] Change all default passwords
- [ ] Use external secret management (Azure Key Vault, AWS Secrets Manager)
- [ ] Configure proper RBAC
- [ ] Enable network policies
- [ ] Set up TLS/SSL certificates
- [ ] Configure backup strategies
- [ ] Set up monitoring and alerting
- [ ] Review resource limits
- [ ] Configure pod security policies

### Secret Management

For production, use external secret management:

```yaml
# Example with External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: azure-keyvault-store
spec:
  provider:
    azurekv:
      url: "https://your-keyvault.vault.azure.net/"
      authSecretRef:
        clientId:
          name: azure-secret
          key: client-id
```

## Troubleshooting

### Common Issues

**Pods stuck in Pending**
```bash
# Check node resources
kubectl describe nodes

# Check PVC status
kubectl get pvc -n banking-platform
```

**Service connection issues**
```bash
# Test service connectivity
kubectl exec -it deployment/banking-platform-frontend -n banking-platform -- curl http://banking-platform-api-gateway/health
```

**Database connection failures**
```bash
# Check database connectivity
kubectl logs deployment/banking-platform-account-service -n banking-platform | grep -i database
```

### Performance Tuning

**Resource Optimization**
```yaml
resources:
  accountService:
    requests:
      cpu: "1000m"
      memory: "2Gi"
    limits:
      cpu: "2000m"
      memory: "4Gi"
```

**JVM Tuning (if applicable)**
```yaml
env:
  - name: JAVA_OPTS
    value: "-Xmx2g -Xms1g -XX:+UseG1GC"
```

## Backup and Recovery

### Database Backup
```bash
# Create database backup job
kubectl create job --from=cronjob/banking-platform-db-backup manual-backup -n banking-platform
```

### Configuration Backup
```bash
# Export current configuration
helm get values banking-platform -n banking-platform > current-config-backup.yaml
```

## Contributing

When modifying the Helm charts:

1. Update Chart.yaml version
2. Add/update values in values.yaml
3. Test with different configurations
4. Update documentation
5. Validate with helm lint

```bash
# Validate chart
helm lint banking-platform/

# Test rendering
helm template banking-platform ./banking-platform --values values-production.yaml

# Dry run deployment
helm install banking-platform ./banking-platform --namespace banking-platform --dry-run
```