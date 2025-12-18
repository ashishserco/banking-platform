# Banking Platform Docker Deployment

This directory contains all the Docker configuration and scripts needed to deploy the complete Banking Platform.

## Quick Start

### Prerequisites
- Docker 20.x or later
- Docker Compose 2.x or later
- At least 8GB RAM available for Docker
- 20GB free disk space

### 1. Environment Setup
```bash
# Copy environment template
cp docker/.env.example docker/.env

# Edit environment variables
nano docker/.env
```

### 2. Build All Images
```bash
# Make scripts executable
chmod +x docker/scripts/*.sh

# Build all Docker images
./docker/scripts/build-all.sh
```

### 3. Deploy the Platform
```bash
# Deploy complete platform
./docker/scripts/deploy.sh development up
```

### 4. Access the Platform
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

## Architecture

### Services
| Service | Port | Description |
|---------|------|-------------|
| banking-ui | 3000 | React frontend application |
| api-gateway | 8000 | Nginx reverse proxy and load balancer |
| account-service | 8001 | Account and customer management |
| transaction-service | 8002 | Transaction processing |
| payment-service | 8003 | Payment gateway and beneficiaries |
| notification-service | 8004 | Email, SMS, and push notifications |

### Infrastructure
| Service | Port | Description |
|---------|------|-------------|
| sql-server | 1433 | Microsoft SQL Server database |
| redis | 6379 | Redis cache for sessions and idempotency |
| elasticsearch | 9200 | Log aggregation and search |
| kibana | 5601 | Log visualization and analysis |
| prometheus | 9090 | Metrics collection and alerting |
| grafana | 3001 | Metrics visualization and dashboards |

## Management Commands

### Build Commands
```bash
# Build all images
./docker/scripts/build-all.sh

# Build specific service
docker build -f docker/backend/AccountService.Dockerfile -t banking-platform/account-service:latest ./backend
```

### Deployment Commands
```bash
# Start platform
./docker/scripts/deploy.sh development up

# Stop platform
./docker/scripts/deploy.sh development down

# Restart platform
./docker/scripts/deploy.sh development restart

# View logs
./docker/scripts/deploy.sh development logs

# Check status
./docker/scripts/deploy.sh development status

# Clean everything
./docker/scripts/deploy.sh development clean
```

### Development Commands
```bash
# Start only infrastructure (DB, Redis, etc.)
docker-compose -f docker/docker-compose.yml up -d sql-server redis elasticsearch

# Scale services
docker-compose -f docker/docker-compose.yml up -d --scale account-service=2

# View specific service logs
docker-compose -f docker/docker-compose.yml logs -f account-service

# Execute commands in containers
docker-compose -f docker/docker-compose.yml exec account-service bash
```

## Configuration

### Environment Variables
Key environment variables in `.env`:

**Database**
- `DB_PASSWORD`: SQL Server SA password
- `DB_USER`: Database username (default: sa)

**Security**
- `JWT_SECRET_KEY`: JWT signing key
- `JWT_ISSUER`: JWT issuer
- `JWT_AUDIENCE`: JWT audience

**External Services**
- `SERVICE_BUS_CONNECTION`: Azure Service Bus connection string
- `SENDGRID_API_KEY`: SendGrid API key for emails
- `TWILIO_ACCOUNT_SID`: Twilio account for SMS

### Service Configuration
Each service can be configured via environment variables or configuration files:

**Account Service**
- Database: BankingAccountsDb
- Features: Customer management, account creation, KYC

**Transaction Service**  
- Database: BankingTransactionsDb
- Features: Money transfers, deposits, withdrawals

**Payment Service**
- Database: BankingPaymentsDb
- Features: Bill payments, mobile recharge, beneficiaries

**Notification Service**
- Database: BankingNotificationsDb  
- Features: Email, SMS, push notifications

## Monitoring and Observability

### Logs
- **Structured Logging**: JSON format for all services
- **Centralized Collection**: Fluent Bit → Elasticsearch → Kibana
- **Log Levels**: Configurable per service

### Metrics
- **Collection**: Prometheus scrapes all services
- **Visualization**: Grafana dashboards
- **Alerting**: Prometheus AlertManager

### Health Checks
- All services expose `/health` endpoints
- Docker health checks monitor service status
- API Gateway health aggregation

### Tracing
- Request correlation IDs across services
- Distributed tracing ready (Jaeger integration available)

## Security

### Network Security
- Internal Docker network isolation
- API Gateway as single entry point
- Rate limiting on all endpoints

### Application Security
- JWT authentication for all APIs
- HTTPS in production (configure certificates)
- CORS protection
- Input validation and sanitization

### Data Security
- Database encryption at rest
- Redis for secure session storage
- Secrets management via environment variables

## Troubleshooting

### Common Issues

**Services won't start**
```bash
# Check logs
docker-compose -f docker/docker-compose.yml logs

# Check container status
docker-compose -f docker/docker-compose.yml ps

# Restart specific service
docker-compose -f docker/docker-compose.yml restart account-service
```

**Database connection issues**
```bash
# Check SQL Server status
docker-compose -f docker/docker-compose.yml logs sql-server

# Test database connection
docker-compose -f docker/docker-compose.yml exec sql-server /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourPassword123!
```

**Performance issues**
```bash
# Check resource usage
docker stats

# Scale services
docker-compose -f docker/docker-compose.yml up -d --scale account-service=3
```

### Health Check Endpoints
- Frontend: http://localhost:3000/health
- API Gateway: http://localhost:8000/health
- Account Service: http://localhost:8001/health
- Transaction Service: http://localhost:8002/health
- Payment Service: http://localhost:8003/health
- Notification Service: http://localhost:8004/health

## Production Considerations

### Before Production Deployment
1. **Security**: Update all default passwords and secrets
2. **Certificates**: Configure SSL/TLS certificates
3. **Monitoring**: Set up proper alerting rules
4. **Backup**: Configure database backup strategies
5. **Scaling**: Plan for horizontal scaling requirements
6. **Networking**: Configure proper network security groups

### Recommended Production Changes
- Use external managed databases (Azure SQL, AWS RDS)
- Implement proper secrets management (Azure Key Vault, AWS Secrets Manager)
- Configure production-grade monitoring and alerting
- Set up CI/CD pipelines for automated deployments
- Implement blue-green or canary deployment strategies