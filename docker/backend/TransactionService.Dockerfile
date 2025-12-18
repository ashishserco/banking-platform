# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set working directory
WORKDIR /src

# Copy solution file
COPY Banking.sln .

# Copy project files
COPY Shared/Banking.Shared/Banking.Shared.csproj Shared/Banking.Shared/
COPY TransactionService/TransactionService.csproj TransactionService/

# Restore dependencies
RUN dotnet restore TransactionService/TransactionService.csproj

# Copy source code
COPY Shared/Banking.Shared/ Shared/Banking.Shared/
COPY TransactionService/ TransactionService/

# Build the application
RUN dotnet publish TransactionService/TransactionService.csproj -c Release -o /app/publish

# Use the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Create logs directory
RUN mkdir -p /app/logs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80

# Start the application
ENTRYPOINT ["dotnet", "TransactionService.dll"]