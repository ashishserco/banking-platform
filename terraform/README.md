# Banking Platform - Azure Infrastructure

This directory contains Terraform configuration for deploying the complete Azure infrastructure required for the banking platform.

## 🏗️ Infrastructure Components

### Core Services
- **Azure Kubernetes Service (AKS)** - Container orchestration with auto-scaling
- **Azure SQL Database** - Managed databases for each microservice
- **Azure Service Bus** - Messaging infrastructure for event-driven architecture
- **Azure Container Registry** - Private container registry
- **Azure Redis Cache** - Session management and caching

### Security & Compliance
- **Azure Key Vault** - Secrets and certificate management
- **Managed Identity** - Secure authentication for services
- **Network Security Groups** - Network-level security
- **Private Endpoints** - Secure connectivity for production

### Monitoring & Observability
- **Application Insights** - Application performance monitoring
- **Log Analytics Workspace** - Centralized logging
- **Azure Monitor** - Infrastructure monitoring

### Storage
- **Azure Storage Account** - Blob storage for backups and documents
- **Premium SSD** - High-performance storage for databases

## 🚀 Quick Start

### Prerequisites
- Azure CLI installed and configured
- Terraform >= 1.0 installed
- Appropriate Azure subscription permissions

### 1. Initial Setup
```bash
# Clone and navigate to terraform directory
cd terraform

# Copy configuration files
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl

# Edit configuration files with your values
nano terraform.tfvars
nano backend.hcl
```

### 2. Backend Setup (First Time Only)
```bash
# Create backend storage for Terraform state
./deploy.sh setup-backend

# Install required tools
./deploy.sh install-tools
```

### 3. Deploy Infrastructure
```bash
# Initialize Terraform
./deploy.sh init

# Create and review deployment plan
./deploy.sh plan

# Apply infrastructure changes
./deploy.sh apply dev
```

### 4. Configure kubectl
```bash
# Configure kubectl to connect to AKS
./deploy.sh configure-kubectl
```

## 📋 Environment Configuration

### Development Environment
```bash
# Deploy development environment
./deploy.sh apply dev
```
- 2-3 AKS nodes
- Basic tier services
- Cost-optimized configuration
- Public endpoints for easy access

### Staging Environment
```bash
# Deploy staging environment  
./deploy.sh apply staging
```
- 3-5 AKS nodes
- Standard tier services
- Production-like configuration
- Enhanced monitoring

### Production Environment
```bash
# Deploy production environment
./deploy.sh apply prod
```
- 5+ AKS nodes with auto-scaling
- Premium tier services
- Private endpoints and enhanced security
- Geo-redundant storage
- Advanced monitoring and alerting

## 🔧 Configuration Options

### Key Variables

| Variable | Description | Default | Environment |
|----------|-------------|---------|-------------|
| `project_name` | Name of the banking platform | `banking-platform` | All |
| `environment` | Environment name | `dev` | All |
| `location` | Azure region | `East US` | All |
| `kubernetes_version` | AKS Kubernetes version | `1.28.3` | All |
| `aks_node_count` | Initial number of AKS nodes | `3` | All |
| `enable_private_cluster` | Enable private AKS cluster | `false` | Dev/Staging |
| `enable_auto_scaling` | Enable AKS auto-scaling | `true` | All |
| `sql_sku_name` | SQL Database SKU | `S2` | All |
| `service_bus_sku` | Service Bus tier | `Standard` | All |
| `acr_sku` | Container Registry tier | `Standard` | All |

### Environment-Specific Defaults

The configuration automatically adjusts based on environment:

**Development (`dev`)**
- Smaller instances and storage
- Public endpoints for testing
- Reduced backup retention
- Cost-optimized settings

**Staging (`staging`)**
- Production-like sizing
- Enhanced monitoring
- Standard backup policies
- Security testing enabled

**Production (`prod`)**
- High-availability configuration
- Private endpoints and enhanced security
- Extended backup retention
- Premium services and geo-redundancy

## 🔒 Security Configuration

### Network Security
- Virtual Network with multiple subnets
- Network Security Groups with restrictive rules
- Private endpoints for production workloads
- Service endpoints for database access

### Identity & Access Management
- Managed Identity for service authentication
- Azure AD integration for AKS
- RBAC enabled throughout
- Key Vault for secrets management

### Data Protection
- Encryption at rest for all services
- TLS 1.2 minimum for all communications
- Backup and disaster recovery
- Audit logging enabled

## 📊 Outputs

After deployment, Terraform provides important outputs:

```bash
# View all outputs
terraform output

# View specific outputs
terraform output aks_cluster_name
terraform output sql_server_fqdn
terraform output key_vault_uri
```

### Key Outputs
- AKS cluster name and FQDN
- SQL Server connection details
- Container Registry login server
- Service Bus namespace information
- Key Vault URI for secrets access
- Storage account details

## 🛠️ Management Commands

### Infrastructure Management
```bash
# View current infrastructure plan
./deploy.sh plan

# Apply infrastructure changes
./deploy.sh apply

# View infrastructure outputs
./deploy.sh output

# Destroy infrastructure (use with caution)
./deploy.sh destroy
```

### Maintenance Commands
```bash
# Format Terraform files
./deploy.sh format

# Validate configuration
./deploy.sh validate

# Initialize after configuration changes
./deploy.sh init
```

## 🔍 Troubleshooting

### Common Issues

**Backend Storage Access**
```bash
# Ensure you have access to the backend storage account
az storage account show --name <storage-account-name>
```

**AKS Cluster Access**
```bash
# Reconfigure kubectl access
az aks get-credentials --resource-group <rg-name> --name <aks-name>
```

**Key Vault Permissions**
```bash
# Check Key Vault access policies
az keyvault show --name <kv-name> --query properties.accessPolicies
```

### Debugging
```bash
# Enable Terraform debug logging
export TF_LOG=DEBUG
./deploy.sh plan
```

## 🏦 Banking-Specific Features

### Compliance & Audit
- Complete audit trail for all resources
- Data retention policies aligned with banking regulations
- Backup and disaster recovery procedures
- Security monitoring and alerting

### Performance & Scalability
- Auto-scaling for peak banking hours
- High-performance storage for financial data
- Geographic redundancy for business continuity
- Load balancing and traffic distribution

### Security & Risk Management
- Defense-in-depth security architecture
- Network micro-segmentation
- Secrets management with Key Vault
- Identity and access management

## 📚 Next Steps

After infrastructure deployment:

1. **Deploy Banking Applications**
   ```bash
   cd ../helm
   ./deploy.sh development banking-platform install-or-upgrade
   ```

2. **Configure Istio Service Mesh**
   ```bash
   cd ../istio
   ./install-istio.sh
   ```

3. **Setup Observability Stack**
   ```bash
   cd ../observability
   ./deploy-observability.sh
   ```

4. **Configure CI/CD Pipelines**
   ```bash
   cd ../pipelines
   # Setup deployment pipelines
   ```

## 🤝 Contributing

When modifying infrastructure:

1. Test changes in development environment first
2. Use `terraform plan` to review changes
3. Apply changes during maintenance windows
4. Update documentation for new components
5. Follow security and compliance guidelines

## 📞 Support

For infrastructure-related issues:
- Check Azure Service Health
- Review Terraform state and logs
- Consult Azure documentation
- Contact platform engineering team