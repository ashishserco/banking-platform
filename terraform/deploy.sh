#!/bin/bash

# Banking Platform - Terraform Deployment Script
# Usage: ./deploy.sh [plan|apply|destroy] [environment]

set -e

# Configuration
ENVIRONMENT=${2:-dev}
ACTION=${1:-plan}
BACKEND_CONFIG="backend.hcl"
VAR_FILE="terraform.tfvars"

echo "🏦 Banking Platform Infrastructure Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "=========================================="

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        echo "❌ Terraform is not installed"
        echo "Please install Terraform: https://www.terraform.io/downloads.html"
        exit 1
    fi
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI is not installed"
        echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        echo "❌ Not logged in to Azure"
        echo "Please run: az login"
        exit 1
    fi
    
    # Check if backend configuration exists
    if [[ ! -f "$BACKEND_CONFIG" ]]; then
        echo "⚠️  Backend configuration file not found: $BACKEND_CONFIG"
        echo "Please copy backend.hcl.example to backend.hcl and customize"
        exit 1
    fi
    
    # Check if variables file exists
    if [[ ! -f "$VAR_FILE" ]]; then
        echo "⚠️  Variables file not found: $VAR_FILE"
        echo "Please copy terraform.tfvars.example to terraform.tfvars and customize"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to initialize Terraform
terraform_init() {
    echo "📦 Initializing Terraform..."
    terraform init -backend-config="$BACKEND_CONFIG" -upgrade
    echo "✅ Terraform initialized"
}

# Function to validate Terraform configuration
terraform_validate() {
    echo "🔍 Validating Terraform configuration..."
    terraform validate
    echo "✅ Terraform configuration is valid"
}

# Function to format Terraform files
terraform_format() {
    echo "🎨 Formatting Terraform files..."
    terraform fmt -recursive
    echo "✅ Terraform files formatted"
}

# Function to create Terraform plan
terraform_plan() {
    echo "📋 Creating Terraform plan..."
    terraform plan -var-file="$VAR_FILE" -out="tfplan-$ENVIRONMENT"
    echo "✅ Terraform plan created"
}

# Function to apply Terraform configuration
terraform_apply() {
    echo "🚀 Applying Terraform configuration..."
    
    if [[ -f "tfplan-$ENVIRONMENT" ]]; then
        terraform apply "tfplan-$ENVIRONMENT"
    else
        echo "⚠️  No plan file found. Creating and applying plan..."
        terraform apply -var-file="$VAR_FILE" -auto-approve
    fi
    
    echo "✅ Terraform configuration applied successfully"
}

# Function to destroy infrastructure
terraform_destroy() {
    echo "🛑 Destroying infrastructure..."
    echo "⚠️  WARNING: This will destroy all infrastructure!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        terraform destroy -var-file="$VAR_FILE" -auto-approve
        echo "✅ Infrastructure destroyed"
    else
        echo "❌ Destroy cancelled"
        exit 1
    fi
}

# Function to show Terraform output
show_output() {
    echo "📊 Infrastructure Output:"
    echo "========================="
    terraform output
}

# Function to setup backend storage account
setup_backend() {
    echo "🗄️  Setting up Terraform backend storage..."
    
    # Read backend configuration
    STORAGE_ACCOUNT=$(grep 'storage_account_name' $BACKEND_CONFIG | cut -d'"' -f2)
    CONTAINER_NAME=$(grep 'container_name' $BACKEND_CONFIG | cut -d'"' -f2)
    RESOURCE_GROUP=$(grep 'resource_group_name' $BACKEND_CONFIG | cut -d'"' -f2)
    
    # Create resource group
    echo "Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "East US"
    
    # Create storage account
    echo "Creating storage account: $STORAGE_ACCOUNT"
    az storage account create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$STORAGE_ACCOUNT" \
        --sku Standard_LRS \
        --encryption-services blob \
        --https-only true \
        --min-tls-version TLS1_2
    
    # Create storage container
    echo "Creating storage container: $CONTAINER_NAME"
    az storage container create \
        --name "$CONTAINER_NAME" \
        --account-name "$STORAGE_ACCOUNT" \
        --auth-mode login
    
    echo "✅ Backend storage setup completed"
}

# Function to install required tools
install_tools() {
    echo "🛠️  Installing required tools..."
    
    # Install kubectl if not present
    if ! command -v kubectl &> /dev/null; then
        echo "Installing kubectl..."
        az aks install-cli
    fi
    
    # Install Helm if not present
    if ! command -v helm &> /dev/null; then
        echo "Installing Helm..."
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi
    
    echo "✅ Tools installation completed"
}

# Function to configure kubectl for AKS
configure_kubectl() {
    echo "⚙️  Configuring kubectl for AKS..."
    
    # Get AKS credentials
    CLUSTER_NAME=$(terraform output -raw aks_cluster_name 2>/dev/null || echo "")
    RESOURCE_GROUP_NAME=$(terraform output -raw resource_group_name 2>/dev/null || echo "")
    
    if [[ -n "$CLUSTER_NAME" && -n "$RESOURCE_GROUP_NAME" ]]; then
        az aks get-credentials --resource-group "$RESOURCE_GROUP_NAME" --name "$CLUSTER_NAME" --overwrite-existing
        echo "✅ kubectl configured for AKS cluster: $CLUSTER_NAME"
    else
        echo "⚠️  Could not configure kubectl. Infrastructure may not be deployed yet."
    fi
}

# Main execution
main() {
    case $ACTION in
        "setup-backend")
            check_prerequisites
            setup_backend
            ;;
        "install-tools")
            install_tools
            ;;
        "init")
            check_prerequisites
            terraform_init
            ;;
        "validate")
            check_prerequisites
            terraform_init
            terraform_validate
            ;;
        "format")
            terraform_format
            ;;
        "plan")
            check_prerequisites
            terraform_init
            terraform_validate
            terraform_plan
            ;;
        "apply")
            check_prerequisites
            terraform_init
            terraform_validate
            terraform_apply
            show_output
            configure_kubectl
            ;;
        "destroy")
            check_prerequisites
            terraform_init
            terraform_destroy
            ;;
        "output")
            show_output
            ;;
        "configure-kubectl")
            configure_kubectl
            ;;
        *)
            echo "❌ Unknown action: $ACTION"
            echo ""
            echo "Available actions:"
            echo "  setup-backend     - Create backend storage account"
            echo "  install-tools     - Install kubectl and Helm"
            echo "  init             - Initialize Terraform"
            echo "  validate         - Validate Terraform configuration"
            echo "  format           - Format Terraform files"
            echo "  plan             - Create Terraform plan"
            echo "  apply            - Apply Terraform configuration"
            echo "  destroy          - Destroy infrastructure"
            echo "  output           - Show Terraform outputs"
            echo "  configure-kubectl - Configure kubectl for AKS"
            echo ""
            echo "Usage: ./deploy.sh [action] [environment]"
            echo "Example: ./deploy.sh apply dev"
            exit 1
            ;;
    esac
}

# Run main function
main