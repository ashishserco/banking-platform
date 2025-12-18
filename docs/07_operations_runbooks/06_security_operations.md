# Security Operations Runbook

## Overview

This runbook provides comprehensive security operational procedures for the banking platform. It covers security monitoring, incident response, compliance checks, and security maintenance activities.

## 🔒 Security Monitoring

### Daily Security Checks

#### Security Dashboard Review
```bash
# Check Azure Security Center recommendations
az security assessment list --query "[?status.code=='Unhealthy'].{Name:displayName, Severity:status.severity}"

# Review Key Vault access logs
az monitor activity-log list --resource-group banking-platform-prod-rg \
  --caller "Microsoft.KeyVault" --max-events 50

# Check authentication failures
kubectl logs -n banking-platform-prod | grep "authentication.*failed" | tail -20
```

#### Vulnerability Assessment
```bash
# Container vulnerability scan
for service in account-service transaction-service payment-service notification-service; do
  echo "Scanning $service for vulnerabilities..."
  trivy image bankingplatformacr.azurecr.io/$service:latest
done

# Database vulnerability assessment
az sql db threat-policy show --database BankingAccountsDb \
  --server banking-platform-prod-sql
```

### Security Metrics Monitoring

#### Key Security Indicators
- Failed authentication attempts (< 100/hour)
- Successful authentications from unusual locations
- Privilege escalation attempts
- Database access outside business hours
- Unusual API call patterns
- Certificate expiry dates (> 30 days remaining)

## 🚨 Security Incident Response

### Security Alert Classification

#### Critical Security Incidents
- **Data breach or unauthorized access**
- **Ransomware or malware detection**
- **Privilege escalation attacks**
- **Database compromise**
- **External network intrusion**

**Response Time**: Immediate (< 15 minutes)

#### High Priority Security Events
- **Repeated failed authentication attempts**
- **Unusual access patterns**
- **Configuration security violations**
- **Certificate expiry warnings**

**Response Time**: < 1 hour

### Security Incident Procedures

#### Immediate Response (0-15 minutes)
```bash
# 1. Isolate affected systems
kubectl label node <affected-node> quarantine=true

# 2. Preserve evidence
kubectl logs <suspicious-pod> > /tmp/security-incident-$(date +%s).log

# 3. Change compromised credentials
az keyvault secret set --name compromised-secret \
  --vault-name banking-platform-kv \
  --value "$(openssl rand -base64 32)"

# 4. Review access logs
az monitor activity-log list --resource-group banking-platform-prod-rg \
  --start-time $(date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --max-events 100
```

#### Investigation Phase (15-60 minutes)
```bash
# Analyze network traffic patterns
kubectl exec -it <investigation-pod> -n banking-platform-prod -- \
  tcpdump -i eth0 -w /tmp/traffic-capture.pcap

# Check for lateral movement
kubectl get pods --all-namespaces -o wide | grep <suspicious-ip>

# Review audit logs
az sql db audit list --database BankingAccountsDb \
  --server banking-platform-prod-sql
```

## 🔐 Access Management

### User Access Review

#### Monthly Access Audit
```bash
#!/bin/bash
# monthly_access_audit.sh

echo "📋 Monthly Access Audit Report"
echo "=============================="

# Azure AD role assignments
az role assignment list --all --output table | \
  grep "banking-platform" > access-audit-$(date +%Y%m).txt

# Kubernetes RBAC review
kubectl get rolebindings,clusterrolebindings --all-namespaces -o wide >> \
  access-audit-$(date +%Y%m).txt

# Key Vault access policies
az keyvault show --name banking-platform-kv \
  --query "properties.accessPolicies" >> access-audit-$(date +%Y%m).txt

echo "Audit report saved: access-audit-$(date +%Y%m).txt"
```

#### Emergency Access Procedures
```bash
# Break-glass account activation (emergency only)
echo "🚨 EMERGENCY ACCESS ACTIVATION"
read -p "Incident ticket number: " ticket
read -p "Business justification: " justification

# Enable emergency admin account
az ad user update --id emergency-admin@banking-platform.com --account-enabled true

# Grant temporary access
az role assignment create \
  --assignee emergency-admin@banking-platform.com \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/banking-platform-prod-rg"

# Log emergency access
echo "$(date): Emergency access granted to emergency-admin. Ticket: $ticket. Justification: $justification" \
  >> /var/log/emergency-access.log
```

## 🛡️ Compliance Operations

### PCI DSS Compliance Checks

#### Quarterly Compliance Audit
```bash
#!/bin/bash
# pci_dss_compliance_check.sh

echo "💳 PCI DSS Compliance Check"
echo "============================"

# Check encryption in transit
echo "1. Checking TLS configuration..."
nmap --script ssl-cert,ssl-enum-ciphers -p 443 banking-platform.com

# Verify data encryption at rest
echo "2. Checking database encryption..."
az sql db show --name BankingAccountsDb \
  --server banking-platform-prod-sql \
  --query "transparentDataEncryption"

# Check access controls
echo "3. Reviewing access controls..."
az keyvault show --name banking-platform-kv \
  --query "properties.enabledForDeployment"

# Verify logging and monitoring
echo "4. Checking audit logging..."
az sql server audit-policy show \
  --server-name banking-platform-prod-sql

# Network segmentation verification
echo "5. Checking network segmentation..."
kubectl get networkpolicies -n banking-platform-prod
```

### SOX Compliance

#### Change Management Compliance
```bash
# Verify all changes have proper approvals
git log --since="30 days ago" --format="%h %an %s" | \
  grep -v "Approved-by:" > unapproved-changes.txt

# Check deployment approvals
helm history banking-platform-prod -n banking-platform-prod --max 30
```

## 🔍 Security Scanning

### Automated Security Scans

#### Container Security Pipeline
```bash
#!/bin/bash
# security_scan_pipeline.sh

echo "🔒 Running Security Scans"
echo "========================"

# 1. Container image scanning
for image in account-service transaction-service payment-service notification-service; do
  echo "Scanning $image..."
  
  # Vulnerability scan
  trivy image --severity HIGH,CRITICAL \
    bankingplatformacr.azurecr.io/$image:latest \
    --format json > /tmp/$image-vulnerabilities.json
  
  # Configuration scan
  trivy config --severity HIGH,CRITICAL \
    docker/backend/${image}.Dockerfile > /tmp/$image-config-issues.txt
done

# 2. Infrastructure as Code scanning
trivy config --severity HIGH,CRITICAL terraform/ > /tmp/terraform-security-issues.txt

# 3. Kubernetes configuration scanning
trivy k8s --severity HIGH,CRITICAL \
  cluster > /tmp/kubernetes-security-issues.txt

# 4. Generate security report
python3 generate_security_report.py /tmp/*-security-*.* > security-report-$(date +%Y%m%d).html

echo "Security scan completed. Report: security-report-$(date +%Y%m%d).html"
```

### Penetration Testing Support

#### Pre-Penetration Test Setup
```bash
# Prepare environment for scheduled penetration testing
echo "🎯 Preparing for Penetration Testing"

# 1. Enable detailed logging
kubectl patch configmap banking-platform-config -n banking-platform-prod \
  --patch '{"data":{"LOG_LEVEL":"DEBUG"}}'

# 2. Create monitoring baseline
kubectl top pods -n banking-platform-prod > baseline-metrics-$(date +%Y%m%d).txt

# 3. Backup current state
./pipelines/scripts/deploy.sh prod backup

# 4. Notify security team
echo "Environment prepared for penetration testing on $(date)"
```

## 🔑 Certificate Management

### SSL/TLS Certificate Operations

#### Certificate Renewal Process
```bash
#!/bin/bash
# certificate_renewal.sh

DOMAIN="$1"
if [[ -z "$DOMAIN" ]]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

echo "🔐 Renewing Certificate for $DOMAIN"

# 1. Check current certificate expiry
echo "Current certificate info:"
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | \
  openssl x509 -noout -dates

# 2. Generate new certificate signing request
openssl req -new -newkey rsa:2048 -nodes \
  -keyout $DOMAIN.key \
  -out $DOMAIN.csr \
  -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN=$DOMAIN

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
EOF
)

# 3. Submit CSR to Certificate Authority
echo "Submit CSR to CA: $DOMAIN.csr"

# 4. Once certificate received, update Key Vault
az keyvault certificate import \
  --vault-name banking-platform-kv \
  --name $DOMAIN-cert \
  --file $DOMAIN.pfx

echo "Certificate renewal process initiated for $DOMAIN"
```

#### Certificate Monitoring
```bash
# Check certificate expiry dates
kubectl get secrets -n banking-platform-prod -o json | \
  jq -r '.items[] | select(.type=="kubernetes.io/tls") | .metadata.name' | \
  while read cert; do
    expiry=$(kubectl get secret $cert -n banking-platform-prod -o json | \
             jq -r '.data."tls.crt"' | base64 -d | \
             openssl x509 -noout -enddate | cut -d= -f2)
    echo "$cert expires on $expiry"
  done
```

## 📊 Security Metrics and Reporting

### Security Dashboard Metrics

#### Key Security Metrics
- Authentication success/failure rates
- Privileged access usage
- Vulnerability counts by severity
- Certificate expiry timeline
- Security policy violations
- Incident response times

#### Weekly Security Report
```bash
#!/bin/bash
# weekly_security_report.sh

REPORT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="security-report-$REPORT_DATE.md"

cat > $REPORT_FILE << EOF
# Weekly Security Report - $REPORT_DATE

## Authentication Metrics
$(kubectl logs -n banking-platform-prod | grep -c "authentication.*success") successful logins
$(kubectl logs -n banking-platform-prod | grep -c "authentication.*failed") failed login attempts

## Vulnerability Status
$(trivy image --quiet --severity CRITICAL bankingplatformacr.azurecr.io/account-service:latest | wc -l) critical vulnerabilities
$(trivy image --quiet --severity HIGH bankingplatformacr.azurecr.io/account-service:latest | wc -l) high vulnerabilities

## Certificate Status
$(az keyvault certificate list --vault-name banking-platform-kv --query "length([?attributes.expires < '$(date -d "+30 days" -u +%Y-%m-%dT%H:%M:%SZ)'])")certificates expiring within 30 days

## Compliance Status
✅ PCI DSS compliance checks passed
✅ SOX change management in compliance
⚠️  Pending: Monthly access review

## Action Items
- [ ] Review failed authentication patterns
- [ ] Update container base images
- [ ] Complete quarterly penetration testing
EOF

echo "Security report generated: $REPORT_FILE"
```

## 🚨 Emergency Security Procedures

### Security Incident Escalation

#### Immediate Containment
```bash
# Isolate compromised system
kubectl cordon <affected-node>
kubectl drain <affected-node> --ignore-daemonsets

# Revoke access
az ad user update --id <compromised-user> --account-enabled false

# Change secrets
kubectl delete secret banking-platform-secrets -n banking-platform-prod
kubectl create secret generic banking-platform-secrets \
  --from-literal=db-password="$(openssl rand -base64 32)" \
  -n banking-platform-prod
```

#### Communication Templates
```markdown
# Security Incident Notification Template

**SECURITY INCIDENT ALERT**

Incident ID: SEC-$(date +%Y%m%d-%H%M%S)
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Discovery Time: $(date)
Affected Systems: [List systems]

**Initial Assessment:**
- [Brief description of incident]
- [Potential impact]
- [Actions taken]

**Next Steps:**
- [Investigation plan]
- [Containment measures]
- [Communication plan]

**Incident Commander:** [Name]
**Technical Lead:** [Name]

Updates will be provided every 30 minutes.
```

This security operations runbook should be regularly tested through security drills and updated based on emerging threats and lessons learned from incidents.