#!/bin/bash

# Start all microservices in the background
echo "Starting Account Service..."
dotnet account/AccountService.dll --urls=http://0.0.0.0:8001 &

echo "Starting Transaction Service..."
dotnet transaction/TransactionService.dll --urls=http://0.0.0.0:8002 &

echo "Starting Payment Service..."
dotnet payment/PaymentService.dll --urls=http://0.0.0.0:8003 &

echo "Starting Notification Service..."
dotnet notification/NotificationService.dll --urls=http://0.0.0.0:8004 &

echo "Starting Support Service..."
dotnet support/SupportService.dll --urls=http://0.0.0.0:8005 &

echo "Starting API Gateway..."
dotnet gateway/ApiGateway.dll --urls=http://0.0.0.0:8080 &

# Wait for services to initialize
sleep 10

# Note: In a consolidated setup without a separate API Gateway project code, 
# we rely on the frontend or a simple entrypoint to route requests.
# However, to maintain the /api/ prefix, we might need a small proxy or 
# simply have one service (like AccountService) act as an entrypoint if configured.
# For Railway, we'll expose one primary port (8080) which will be mapped to the service that handles routing.

# For this demo, we'll use a simple approach where we expect the frontend to call specific ports if possible, 
# or we can use a basic Nginx setup if required. 
# BUT for simplicity on free hosting, we will keep them separate and use Railway's internal networking if possible.

# Keep the script running
wait
