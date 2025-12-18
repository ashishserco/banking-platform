#!/bin/bash

# Banking Platform Deployment Script
# Enterprise-grade deployment automation with rollback support

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENVIRONMENT=${1:-dev}
ACTION=${2:-deploy}
BUILD_ID=${3:-latest}

# Default values
NAMESPACE="banking-platform-${ENVIRONMENT}"
RELEASE_NAME="banking-platform-${ENVIRONMENT}"
HELM_CHART_PATH="${PROJECT_ROOT}/helm/banking-platform"
VALUES_FILE="${HELM_CHART_PATH}/values-${ENVIRONMENT}.yaml"

echo "🏦 Banking Platform Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "Build ID: $BUILD_ID"
echo "Namespace: $NAMESPACE"
echo "================================="

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed"
        exit 1
    fi
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        echo "❌ Helm is not installed"
        exit 1
    fi
    
    # Check if values file exists
    if [[ ! -f "$VALUES_FILE" ]]; then
        echo "❌ Values file not found: $VALUES_FILE"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to create namespace if not exists
ensure_namespace() {
    echo "📁 Ensuring namespace exists..."
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace for Istio injection
    kubectl label namespace "$NAMESPACE" istio-injection=enabled --overwrite
    
    echo "✅ Namespace $NAMESPACE ready"
}

# Function to deploy application
deploy_application() {
    echo "🚀 Deploying Banking Platform..."
    
    # Prepare Helm values
    local extra_args=""
    if [[ "$BUILD_ID" != "latest" ]]; then
        extra_args="--set global.image.tag=$BUILD_ID"
    fi
    
    # Deploy with Helm
    helm upgrade --install "$RELEASE_NAME" "$HELM_CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE" \
        --set global.environment="$ENVIRONMENT" \
        $extra_args \
        --wait \
        --timeout=600s
    
    echo "✅ Application deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Wait for deployments to be ready
    local services=("account-service" "transaction-service" "payment-service" "notification-service" "frontend")
    
    for service in "${services[@]}"; do
        echo "Checking $service..."
        kubectl wait --for=condition=available \
            --timeout=300s \
            deployment/"${RELEASE_NAME}-${service}" \
            -n "$NAMESPACE" || {
            echo "❌ $service failed to become ready"
            return 1
        }
    done
    
    # Check pod status
    echo "📊 Pod Status:"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    # Check service status
    echo "🌐 Service Status:"
    kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo "✅ Deployment verification completed"
}

# Function to run health checks
run_health_checks() {
    echo "🏥 Running health checks..."
    
    local health_check_timeout=60
    local check_interval=5
    local elapsed=0
    
    while [[ $elapsed -lt $health_check_timeout ]]; do
        if check_service_health; then
            echo "✅ All health checks passed"
            return 0
        fi
        
        echo "⏳ Health checks not ready, waiting ${check_interval}s..."
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    echo "❌ Health checks failed after ${health_check_timeout}s"
    return 1
}

# Function to check service health
check_service_health() {
    local services=("account-service" "transaction-service" "payment-service" "notification-service")
    
    for service in "${services[@]}"; do
        local pod_name=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name="$service" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [[ -z "$pod_name" ]]; then
            echo "No pod found for $service"
            return 1
        fi
        
        # Check health endpoint
        if ! kubectl exec -n "$NAMESPACE" "$pod_name" -- wget -q --spider http://localhost/health; then
            echo "$service health check failed"
            return 1
        fi
    done
    
    return 0
}

# Function to rollback deployment
rollback_deployment() {
    echo "⏪ Rolling back deployment..."
    
    # Get previous revision
    local previous_revision=$(helm history "$RELEASE_NAME" -n "$NAMESPACE" --max 2 -o json | jq -r '.[1].revision // empty')
    
    if [[ -z "$previous_revision" ]]; then
        echo "❌ No previous revision found for rollback"
        return 1
    fi
    
    echo "Rolling back to revision $previous_revision..."
    helm rollback "$RELEASE_NAME" "$previous_revision" -n "$NAMESPACE" --wait --timeout=300s
    
    # Verify rollback
    if verify_deployment; then
        echo "✅ Rollback completed successfully"
    else
        echo "❌ Rollback verification failed"
        return 1
    fi
}

# Function to show deployment status
show_status() {
    echo "📊 Deployment Status"
    echo "===================="
    
    # Helm release info
    echo "📦 Helm Release:"
    helm status "$RELEASE_NAME" -n "$NAMESPACE"
    
    echo ""
    echo "📊 Pods:"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo ""
    echo "🌐 Services:"
    kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo ""
    echo "📈 Resource Usage:"
    kubectl top pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME" || echo "Metrics not available"
}

# Function to cleanup deployment
cleanup_deployment() {
    echo "🧹 Cleaning up deployment..."
    
    read -p "Are you sure you want to delete $RELEASE_NAME in $NAMESPACE? (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"
        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
        echo "✅ Cleanup completed"
    else
        echo "❌ Cleanup cancelled"
    fi
}

# Function to create backup
create_backup() {
    echo "💾 Creating deployment backup..."
    
    local backup_dir="${PROJECT_ROOT}/backups/${ENVIRONMENT}/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup Helm values
    helm get values "$RELEASE_NAME" -n "$NAMESPACE" > "$backup_dir/values.yaml"
    
    # Backup Kubernetes resources
    kubectl get all -n "$NAMESPACE" -o yaml > "$backup_dir/resources.yaml"
    
    # Backup secrets and configmaps
    kubectl get secrets,configmaps -n "$NAMESPACE" -o yaml > "$backup_dir/configs.yaml"
    
    echo "✅ Backup created: $backup_dir"
}

# Function to apply database migrations
apply_migrations() {
    echo "🔄 Applying database migrations..."
    
    # Wait for database to be ready
    local db_ready=false
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]] && [[ $db_ready == false ]]; do
        if kubectl exec -n "$NAMESPACE" deployment/"${RELEASE_NAME}-account-service" -- \
           dotnet --version &> /dev/null; then
            db_ready=true
        else
            echo "Waiting for application to be ready..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [[ $db_ready == false ]]; then
        echo "❌ Application not ready for migrations"
        return 1
    fi
    
    # Run migrations for each service
    local services=("account-service" "transaction-service" "payment-service" "notification-service")
    
    for service in "${services[@]}"; do
        echo "Running migrations for $service..."
        kubectl exec -n "$NAMESPACE" deployment/"${RELEASE_NAME}-${service}" -- \
            dotnet ef database update || {
            echo "❌ Migration failed for $service"
            return 1
        }
    done
    
    echo "✅ Database migrations completed"
}

# Main execution
main() {
    case $ACTION in
        "deploy")
            check_prerequisites
            ensure_namespace
            deploy_application
            apply_migrations
            verify_deployment
            run_health_checks
            show_status
            ;;
        "rollback")
            check_prerequisites
            rollback_deployment
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup_deployment
            ;;
        "backup")
            create_backup
            ;;
        "health")
            run_health_checks
            ;;
        *)
            echo "❌ Unknown action: $ACTION"
            echo ""
            echo "Available actions:"
            echo "  deploy    - Deploy the application"
            echo "  rollback  - Rollback to previous version"
            echo "  status    - Show deployment status"
            echo "  cleanup   - Remove deployment"
            echo "  backup    - Create backup"
            echo "  health    - Run health checks"
            echo ""
            echo "Usage: ./deploy.sh [environment] [action] [build_id]"
            echo "Example: ./deploy.sh dev deploy 123"
            exit 1
            ;;
    esac
}

# Run main function
main