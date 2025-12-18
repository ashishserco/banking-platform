#!/bin/bash

# Deploy Banking Platform using Helm
# Usage: ./deploy.sh [environment] [namespace] [action]

set -e

ENVIRONMENT=${1:-development}
NAMESPACE=${2:-banking-platform}
ACTION=${3:-install}
RELEASE_NAME="banking-platform-$ENVIRONMENT"

echo "🏦 Banking Platform Helm Deployment"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Release: $RELEASE_NAME"
echo "Action: $ACTION"
echo "=================================="

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ Cannot connect to Kubernetes cluster"
        echo "Please ensure your kubeconfig is properly configured"
        exit 1
    fi
    
    echo "✅ Kubernetes cluster connection verified"
}

# Function to check if helm is available
check_helm() {
    if ! command -v helm &> /dev/null; then
        echo "❌ Helm is not installed or not in PATH"
        exit 1
    fi
    
    echo "✅ Helm CLI found"
}

# Function to create namespace if it doesn't exist
ensure_namespace() {
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        echo "📁 Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    else
        echo "✅ Namespace $NAMESPACE already exists"
    fi
}

# Function to add required Helm repositories
add_helm_repos() {
    echo "📦 Adding Helm repositories..."
    
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    
    helm repo update
    echo "✅ Helm repositories updated"
}

# Function to install or upgrade the release
deploy_release() {
    local values_file="values-$ENVIRONMENT.yaml"
    
    if [[ ! -f "banking-platform/$values_file" ]]; then
        echo "⚠️  Environment-specific values file not found: $values_file"
        echo "Using default values.yaml"
        values_file="values.yaml"
    fi
    
    case $ACTION in
        "install")
            echo "🚀 Installing Banking Platform..."
            helm install "$RELEASE_NAME" ./banking-platform \
                --namespace "$NAMESPACE" \
                --values "banking-platform/$values_file" \
                --wait \
                --timeout 10m
            ;;
            
        "upgrade")
            echo "🔄 Upgrading Banking Platform..."
            helm upgrade "$RELEASE_NAME" ./banking-platform \
                --namespace "$NAMESPACE" \
                --values "banking-platform/$values_file" \
                --wait \
                --timeout 10m
            ;;
            
        "install-or-upgrade")
            echo "🚀 Installing or upgrading Banking Platform..."
            helm upgrade --install "$RELEASE_NAME" ./banking-platform \
                --namespace "$NAMESPACE" \
                --values "banking-platform/$values_file" \
                --wait \
                --timeout 10m
            ;;
            
        "uninstall")
            echo "🛑 Uninstalling Banking Platform..."
            helm uninstall "$RELEASE_NAME" --namespace "$NAMESPACE"
            echo "✅ Banking Platform uninstalled"
            return 0
            ;;
            
        "status")
            helm status "$RELEASE_NAME" --namespace "$NAMESPACE"
            return 0
            ;;
            
        "list")
            helm list --namespace "$NAMESPACE"
            return 0
            ;;
            
        *)
            echo "❌ Unknown action: $ACTION"
            echo "Available actions: install, upgrade, install-or-upgrade, uninstall, status, list"
            exit 1
            ;;
    esac
}

# Function to wait for deployment to be ready
wait_for_deployment() {
    echo "⏳ Waiting for deployments to be ready..."
    
    local services=("account-service" "transaction-service" "payment-service" "notification-service" "api-gateway" "frontend")
    
    for service in "${services[@]}"; do
        echo "Waiting for $service..."
        kubectl wait --namespace "$NAMESPACE" \
            --for=condition=available \
            --timeout=300s \
            deployment/"$RELEASE_NAME-$service" || true
    done
}

# Function to show deployment information
show_deployment_info() {
    echo ""
    echo "📊 Deployment Information:"
    echo "========================="
    
    echo ""
    echo "📋 Pods:"
    kubectl get pods --namespace "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo ""
    echo "🌐 Services:"
    kubectl get svc --namespace "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo ""
    echo "🔗 Ingress:"
    kubectl get ingress --namespace "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME" 2>/dev/null || echo "No ingress configured"
    
    echo ""
    echo "💾 Persistent Volumes:"
    kubectl get pvc --namespace "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME" 2>/dev/null || echo "No PVCs found"
}

# Main execution
main() {
    check_kubectl
    check_helm
    
    if [[ "$ACTION" != "uninstall" && "$ACTION" != "status" && "$ACTION" != "list" ]]; then
        ensure_namespace
        add_helm_repos
    fi
    
    deploy_release
    
    if [[ "$ACTION" == "install" || "$ACTION" == "upgrade" || "$ACTION" == "install-or-upgrade" ]]; then
        wait_for_deployment
        show_deployment_info
        echo ""
        echo "✅ Banking Platform deployment completed!"
        echo ""
        echo "🔍 To check the status: helm status $RELEASE_NAME --namespace $NAMESPACE"
        echo "📊 To view logs: kubectl logs -f deployment/$RELEASE_NAME-api-gateway --namespace $NAMESPACE"
    fi
}

# Run main function
main