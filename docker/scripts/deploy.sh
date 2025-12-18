#!/bin/bash

# Deploy Banking Platform using Docker Compose
# Usage: ./deploy.sh [environment] [action]

set -e

ENVIRONMENT=${1:-development}
ACTION=${2:-up}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🏦 Banking Platform Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "=========================="

cd "$PROJECT_ROOT"

# Function to wait for service to be healthy
wait_for_service() {
    local service_name=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    echo "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker/docker-compose.yml ps $service_name | grep -q "healthy"; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    echo "❌ $service_name failed to become healthy"
    return 1
}

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to build images if they don't exist
ensure_images() {
    echo "🔍 Checking if images exist..."
    
    local images=(
        "banking-platform/account-service:latest"
        "banking-platform/transaction-service:latest"
        "banking-platform/payment-service:latest"
        "banking-platform/notification-service:latest"
        "banking-platform/banking-ui:latest"
        "banking-platform/api-gateway:latest"
    )
    
    local missing_images=false
    for image in "${images[@]}"; do
        if ! docker images "$image" | grep -q "$image"; then
            echo "❌ Image $image not found"
            missing_images=true
        fi
    done
    
    if [ "$missing_images" = true ]; then
        echo "📦 Building missing images..."
        ./docker/scripts/build-all.sh
    else
        echo "✅ All images exist"
    fi
}

# Main deployment logic
case $ACTION in
    "up")
        check_prerequisites
        ensure_images
        
        echo "🚀 Starting Banking Platform..."
        docker-compose -f docker/docker-compose.yml up -d
        
        echo "⏳ Waiting for core infrastructure..."
        wait_for_service "sql-server"
        wait_for_service "redis"
        
        echo "⏳ Waiting for microservices..."
        wait_for_service "account-service"
        wait_for_service "transaction-service"
        wait_for_service "payment-service"
        wait_for_service "notification-service"
        
        echo "⏳ Waiting for gateway and frontend..."
        wait_for_service "api-gateway"
        wait_for_service "banking-ui"
        
        echo "✅ Banking Platform is ready!"
        echo ""
        echo "🌐 Access URLs:"
        echo "   Frontend:     http://localhost:3000"
        echo "   API Gateway:  http://localhost:8000"
        echo "   Grafana:      http://localhost:3001 (admin/admin)"
        echo "   Kibana:       http://localhost:5601"
        echo "   Prometheus:   http://localhost:9090"
        echo ""
        echo "📊 Service Status:"
        docker-compose -f docker/docker-compose.yml ps
        ;;
        
    "down")
        echo "🛑 Stopping Banking Platform..."
        docker-compose -f docker/docker-compose.yml down
        echo "✅ Banking Platform stopped"
        ;;
        
    "restart")
        echo "🔄 Restarting Banking Platform..."
        docker-compose -f docker/docker-compose.yml restart
        echo "✅ Banking Platform restarted"
        ;;
        
    "logs")
        echo "📋 Showing logs..."
        docker-compose -f docker/docker-compose.yml logs -f
        ;;
        
    "status")
        echo "📊 Platform Status:"
        docker-compose -f docker/docker-compose.yml ps
        ;;
        
    "clean")
        echo "🧹 Cleaning up..."
        docker-compose -f docker/docker-compose.yml down -v
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
        
    *)
        echo "❌ Unknown action: $ACTION"
        echo "Available actions: up, down, restart, logs, status, clean"
        exit 1
        ;;
esac