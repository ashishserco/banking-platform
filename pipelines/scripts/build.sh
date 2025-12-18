#!/bin/bash

# Banking Platform Build Script
# Comprehensive build automation for all services

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_ID=${1:-$(date +%Y%m%d-%H%M%S)}
REGISTRY=${2:-bankingplatformacr.azurecr.io}
PUSH_IMAGES=${3:-false}

echo "🏗️ Banking Platform Build"
echo "Build ID: $BUILD_ID"
echo "Registry: $REGISTRY"
echo "Push Images: $PUSH_IMAGES"
echo "========================="

# Function to build .NET services
build_backend() {
    echo "🔧 Building backend services..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Restore dependencies
    echo "📦 Restoring NuGet packages..."
    dotnet restore Banking.sln
    
    # Build solution
    echo "🏗️ Building solution..."
    dotnet build Banking.sln --configuration Release --no-restore
    
    # Run tests
    echo "🧪 Running tests..."
    dotnet test Banking.sln \
        --configuration Release \
        --no-build \
        --collect:"XPlat Code Coverage" \
        --logger trx \
        --results-directory TestResults/
    
    echo "✅ Backend build completed"
}

# Function to build frontend
build_frontend() {
    echo "🌐 Building frontend..."
    
    cd "$PROJECT_ROOT/frontend/banking-ui"
    
    # Install dependencies
    echo "📦 Installing npm packages..."
    npm ci
    
    # Run linting
    echo "🔍 Running linting..."
    npm run lint
    
    # Run tests
    echo "🧪 Running tests..."
    npm run test -- --coverage --watchAll=false
    
    # Build application
    echo "🏗️ Building application..."
    npm run build
    
    echo "✅ Frontend build completed"
}

# Function to build Docker image
build_docker_image() {
    local service_name=$1
    local dockerfile=$2
    local build_context=$3
    
    echo "🐳 Building Docker image for $service_name..."
    
    cd "$PROJECT_ROOT"
    
    # Build image with multiple tags
    docker build \
        -t "$REGISTRY/$service_name:$BUILD_ID" \
        -t "$REGISTRY/$service_name:latest" \
        -f "$dockerfile" \
        --build-arg BUILD_NUMBER="$BUILD_ID" \
        --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --build-arg GIT_COMMIT="$(git rev-parse --short HEAD)" \
        "$build_context"
    
    # Security scan
    echo "🔒 Running security scan for $service_name..."
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL \
        "$REGISTRY/$service_name:$BUILD_ID" || echo "Security scan completed with warnings"
    
    # Push image if requested
    if [[ "$PUSH_IMAGES" == "true" ]]; then
        echo "📤 Pushing image for $service_name..."
        docker push "$REGISTRY/$service_name:$BUILD_ID"
        docker push "$REGISTRY/$service_name:latest"
    fi
    
    echo "✅ Docker image built for $service_name"
}

# Function to build all Docker images
build_all_images() {
    echo "🐳 Building all Docker images..."
    
    # Backend services
    build_docker_image "account-service" "docker/backend/AccountService.Dockerfile" "backend"
    build_docker_image "transaction-service" "docker/backend/TransactionService.Dockerfile" "backend"
    build_docker_image "payment-service" "docker/backend/PaymentService.Dockerfile" "backend"
    build_docker_image "notification-service" "docker/backend/NotificationService.Dockerfile" "backend"
    
    # Frontend
    build_docker_image "frontend" "docker/frontend/Dockerfile" "frontend/banking-ui"
    
    echo "✅ All Docker images built"
}

# Function to run security scans
run_security_scans() {
    echo "🔒 Running security scans..."
    
    # Scan .NET dependencies
    echo "🔍 Scanning .NET dependencies..."
    cd "$PROJECT_ROOT/backend"
    dotnet list Banking.sln package --vulnerable --include-transitive || echo "Vulnerability scan completed"
    
    # Scan Node.js dependencies
    echo "🔍 Scanning Node.js dependencies..."
    cd "$PROJECT_ROOT/frontend/banking-ui"
    npm audit --audit-level moderate || echo "Audit completed"
    
    # Filesystem security scan
    echo "🔍 Running filesystem security scan..."
    cd "$PROJECT_ROOT"
    docker run --rm -v "$(pwd):/workspace" \
        aquasec/trivy fs --security-checks vuln,secret,config \
        --format table /workspace || echo "Filesystem scan completed"
    
    echo "✅ Security scans completed"
}

# Function to generate build artifacts
generate_artifacts() {
    echo "📦 Generating build artifacts..."
    
    local artifacts_dir="$PROJECT_ROOT/artifacts/$BUILD_ID"
    mkdir -p "$artifacts_dir"
    
    # Copy build outputs
    if [[ -d "$PROJECT_ROOT/backend/AccountService/bin/Release" ]]; then
        cp -r "$PROJECT_ROOT/backend/AccountService/bin/Release" "$artifacts_dir/account-service"
    fi
    
    if [[ -d "$PROJECT_ROOT/frontend/banking-ui/build" ]]; then
        cp -r "$PROJECT_ROOT/frontend/banking-ui/build" "$artifacts_dir/frontend"
    fi
    
    # Generate build manifest
    cat > "$artifacts_dir/build-manifest.json" << EOF
{
    "buildId": "$BUILD_ID",
    "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "gitCommit": "$(git rev-parse HEAD)",
    "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
    "registry": "$REGISTRY",
    "images": [
        "$REGISTRY/account-service:$BUILD_ID",
        "$REGISTRY/transaction-service:$BUILD_ID",
        "$REGISTRY/payment-service:$BUILD_ID",
        "$REGISTRY/notification-service:$BUILD_ID",
        "$REGISTRY/frontend:$BUILD_ID"
    ]
}
EOF
    
    echo "✅ Artifacts generated: $artifacts_dir"
}

# Function to validate build
validate_build() {
    echo "✅ Validating build..."
    
    # Check if all expected Docker images exist
    local images=("account-service" "transaction-service" "payment-service" "notification-service" "frontend")
    
    for image in "${images[@]}"; do
        if docker images "$REGISTRY/$image:$BUILD_ID" | grep -q "$BUILD_ID"; then
            echo "✅ $image image exists"
        else
            echo "❌ $image image missing"
            return 1
        fi
    done
    
    # Validate frontend build
    if [[ -d "$PROJECT_ROOT/frontend/banking-ui/build" ]]; then
        echo "✅ Frontend build exists"
    else
        echo "❌ Frontend build missing"
        return 1
    fi
    
    echo "✅ Build validation completed"
}

# Function to cleanup build artifacts
cleanup_build() {
    echo "🧹 Cleaning up build artifacts..."
    
    # Clean .NET build outputs
    cd "$PROJECT_ROOT/backend"
    dotnet clean Banking.sln
    
    # Clean Node.js build outputs
    cd "$PROJECT_ROOT/frontend/banking-ui"
    rm -rf build node_modules/.cache
    
    # Clean Docker build cache
    docker builder prune -f
    
    echo "✅ Build cleanup completed"
}

# Main execution
main() {
    echo "🚀 Starting build process..."
    
    # Build backend
    build_backend
    
    # Build frontend
    build_frontend
    
    # Run security scans
    run_security_scans
    
    # Build Docker images
    build_all_images
    
    # Generate artifacts
    generate_artifacts
    
    # Validate build
    validate_build
    
    echo "🎉 Build completed successfully!"
    echo "Build ID: $BUILD_ID"
    echo "Artifacts: $PROJECT_ROOT/artifacts/$BUILD_ID"
}

# Handle command line arguments
case "${1:-build}" in
    "build")
        main
        ;;
    "backend")
        build_backend
        ;;
    "frontend")
        build_frontend
        ;;
    "images")
        build_all_images
        ;;
    "security")
        run_security_scans
        ;;
    "cleanup")
        cleanup_build
        ;;
    "validate")
        validate_build
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        echo "Available commands:"
        echo "  build      - Full build process (default)"
        echo "  backend    - Build backend only"
        echo "  frontend   - Build frontend only"
        echo "  images     - Build Docker images only"
        echo "  security   - Run security scans only"
        echo "  cleanup    - Clean build artifacts"
        echo "  validate   - Validate build outputs"
        echo ""
        echo "Usage: ./build.sh [command] [build_id] [registry] [push_images]"
        echo "Example: ./build.sh build 123 myregistry.azurecr.io true"
        exit 1
        ;;
esac