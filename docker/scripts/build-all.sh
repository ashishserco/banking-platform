#!/bin/bash

# Build all Docker images for the Banking Platform
# Usage: ./build-all.sh [environment]

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🏦 Building Banking Platform Docker Images"
echo "Environment: $ENVIRONMENT"
echo "Project Root: $PROJECT_ROOT"
echo "====================================="

cd "$PROJECT_ROOT"

# Build backend services
echo "📦 Building backend services..."

echo "Building Account Service..."
docker build -f docker/backend/AccountService.Dockerfile -t banking-platform/account-service:latest ./backend

echo "Building Transaction Service..."
docker build -f docker/backend/TransactionService.Dockerfile -t banking-platform/transaction-service:latest ./backend

echo "Building Payment Service..."
docker build -f docker/backend/PaymentService.Dockerfile -t banking-platform/payment-service:latest ./backend

echo "Building Notification Service..."
docker build -f docker/backend/NotificationService.Dockerfile -t banking-platform/notification-service:latest ./backend

# Build frontend
echo "📱 Building frontend..."
docker build -f docker/frontend/Dockerfile -t banking-platform/banking-ui:latest ./frontend/banking-ui

# Build API Gateway
echo "🌐 Building API Gateway..."
docker build -f docker/nginx/Dockerfile -t banking-platform/api-gateway:latest ./docker/nginx

echo "✅ All images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep banking-platform

echo ""
echo "🚀 To start the platform, run:"
echo "   docker-compose -f docker/docker-compose.yml up -d"