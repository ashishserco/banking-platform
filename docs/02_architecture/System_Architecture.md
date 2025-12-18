# System Architecture

## Architecture Overview

This document explains the technical architecture of our cloud-native banking platform, demonstrating enterprise-grade patterns used by real banks.

## High-Level Architecture

```
                                    ┌─────────────────────┐
                                    │     Azure CDN       │
                                    │   (Static Assets)   │
                                    └──────────┬──────────┘
                                               │
┌─────────────────────┐                       │                    ┌─────────────────────┐
│    Mobile App       │                       │                    │    Web Portal       │
│   (React Native)    │───────────────────────┼────────────────────│   (React/TypeScript)│
└─────────────────────┘                       │                    └─────────────────────┘
                                               │
                              ┌────────────────┴────────────────┐
                              │         Azure API Gateway       │
                              │      (Authentication/Rate       │
                              │         Limiting/Routing)       │
                              └────────────────┬────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
        ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
        │   Account Service   │    │ Transaction Service │    │  Payment Service    │
        │     (Port 8001)     │    │     (Port 8002)     │    │    (Port 8003)      │
        │                     │    │                     │    │                     │
        │ • Account CRUD      │    │ • Money Transfer    │    │ • Bill Payments     │
        │ • Balance Inquiry   │    │ • Transaction Log   │    │ • External Gateway  │
        │ • KYC Management    │    │ • Audit Trail       │    │ • Idempotency       │
        └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘
                   │                          │                          │
                   ▼                          ▼                          ▼
        ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
        │    Azure SQL DB     │    │    Azure SQL DB     │    │    Azure SQL DB     │
        │  (Account Schema)   │    │ (Transaction Schema)│    │  (Payment Schema)   │
        └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────────────┐
                              │        Azure Service Bus           │
                              │                                    │
                              │ Topics:                           │
                              │ • account.events                 │
                              │ • transaction.events             │
                              │ • payment.events                 │
                              └────────────────┬───────────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────────┐
                              │      Notification Service           │
                              │        (Port 8004)                  │
                              │                                     │
                              │ • Email Notifications               │
                              │ • SMS Alerts                        │
                              │ • Push Notifications                │
                              │ • Audit Log Processing              │
                              └─────────────────────────────────────┘
```

## Microservices Design

### Service Boundaries (Domain-Driven Design)

**Account Bounded Context**
- Aggregate Root: `Account`
- Entities: `Customer`, `AccountHolder`, `AccountSettings`
- Value Objects: `AccountNumber`, `Balance`, `Currency`
- Business Rules: Account creation, KYC validation, balance calculation

**Transaction Bounded Context**
- Aggregate Root: `Transaction`
- Entities: `TransactionEntry`, `AuditLog`
- Value Objects: `Amount`, `TransactionId`, `Timestamp`
- Business Rules: Double-entry bookkeeping, transaction atomicity

**Payment Bounded Context**
- Aggregate Root: `Payment`
- Entities: `PaymentInstruction`, `PaymentStatus`
- Value Objects: `PaymentId`, `BeneficiaryDetails`, `PaymentMethod`
- Business Rules: Idempotency, external gateway integration

### Communication Patterns

**Synchronous Communication (REST + gRPC)**
```
┌─────────────┐    HTTP/REST     ┌─────────────┐    gRPC        ┌─────────────┐
│   Frontend  │─────────────────▶│   API GW    │───────────────▶│  Services   │
└─────────────┘                  └─────────────┘                └─────────────┘

Use Cases:
• Real-time balance queries
• Account creation
• Transaction initiation
• Payment processing
```

**Asynchronous Communication (Azure Service Bus)**
```
┌─────────────┐   Publish Event   ┌─────────────┐   Subscribe    ┌─────────────┐
│  Publisher  │──────────────────▶│ Service Bus │───────────────▶│ Subscriber  │
│  Service    │                   │   Topics    │                │  Service    │
└─────────────┘                   └─────────────┘                └─────────────┘

Use Cases:
• Account created → Send welcome email
• Transaction completed → Update notifications
• Payment failed → Alert customer service
```

## Data Architecture

### Database per Service Pattern

**Why Database per Service?**
- **Data Isolation**: Each service owns its data
- **Technology Choice**: Different services can use different databases
- **Scalability**: Independent scaling per service
- **Failure Isolation**: Database issues don't cascade

**Account Database Schema**
```sql
-- Accounts table with banking standards
CREATE TABLE Accounts (
    AccountId UNIQUEIDENTIFIER PRIMARY KEY,
    AccountNumber VARCHAR(20) NOT NULL UNIQUE, -- IBAN format
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    AccountType VARCHAR(20) NOT NULL, -- SAVINGS, CURRENT, LOAN
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Accounts_AccountNumber ON Accounts(AccountNumber);
CREATE INDEX IX_Accounts_CustomerId ON Accounts(CustomerId);
```

**Transaction Database Schema**
```sql
-- Double-entry bookkeeping pattern
CREATE TABLE Transactions (
    TransactionId UNIQUEIDENTIFIER PRIMARY KEY,
    IdempotencyKey VARCHAR(100) NOT NULL UNIQUE,
    FromAccountNumber VARCHAR(20),
    ToAccountNumber VARCHAR(20),
    Amount DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) NOT NULL,
    TransactionType VARCHAR(20) NOT NULL, -- TRANSFER, DEPOSIT, WITHDRAWAL
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL
);

CREATE INDEX IX_Transactions_IdempotencyKey ON Transactions(IdempotencyKey);
CREATE INDEX IX_Transactions_AccountNumbers ON Transactions(FromAccountNumber, ToAccountNumber);
```

### Event Sourcing for Audit Trail

**Why Event Sourcing?**
- **Regulatory Compliance**: Complete audit trail
- **Debugging**: Replay events to understand state
- **Business Intelligence**: Analytics on event stream

**Event Store Pattern**
```sql
CREATE TABLE EventStore (
    EventId UNIQUEIDENTIFIER PRIMARY KEY,
    StreamId UNIQUEIDENTIFIER NOT NULL, -- Aggregate ID
    EventType VARCHAR(100) NOT NULL,
    EventData NVARCHAR(MAX) NOT NULL, -- JSON
    EventVersion INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_EventStore_StreamId ON EventStore(StreamId, EventVersion);
```

## Security Architecture

### Multi-Layer Security

**API Gateway Layer**
- OAuth 2.0 / OpenID Connect
- Rate limiting per client
- Request/Response validation
- CORS policies

**Service-to-Service Communication**
- mTLS for internal communication
- JWT tokens for authentication
- Service mesh security policies (Istio)

**Data Layer**
- Encryption at rest (Azure SQL TDE)
- Encryption in transit (TLS 1.3)
- Row-level security for multi-tenancy

### Security Patterns

**Authentication Flow**
```
┌─────────────┐    1. Login      ┌─────────────┐    2. Validate   ┌─────────────┐
│   Client    │─────────────────▶│   API GW    │─────────────────▶│ Auth Service│
└─────────────┘                  └─────────────┘                  └─────────────┘
       ▲                                │                                │
       │                                │3. JWT Token                    │
       │                                ◀────────────────────────────────┘
       │4. Subsequent calls with JWT
       │
       ▼
┌─────────────┐    5. Validate   ┌─────────────┐
│ Microservice│◀─────────────────│   API GW    │
└─────────────┘                  └─────────────┘
```

## Observability Architecture

### Three Pillars of Observability

**1. Logging (ELK Stack)**
- **Fluent Bit**: Log collection from containers
- **Elasticsearch**: Log storage and indexing
- **Kibana**: Log visualization and search

**2. Metrics (Prometheus + Grafana)**
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and alerting
- **Custom Metrics**: Business KPIs and SLAs

**3. Tracing (Jaeger + Istio)**
- **Istio/Envoy**: Automatic trace collection
- **Jaeger**: Distributed tracing storage
- **Custom Spans**: Business operation tracing

### Observability Data Flow

```
┌─────────────┐    Logs     ┌─────────────┐    Forward   ┌─────────────┐
│Microservice │────────────▶│ Fluent Bit  │─────────────▶│Elasticsearch│
└─────────────┘             └─────────────┘              └─────────────┘
       │
       │Metrics
       ▼
┌─────────────┐    Scrape    ┌─────────────┐    Query     ┌─────────────┐
│ /metrics    │◀─────────────│ Prometheus  │◀─────────────│  Grafana    │
│ Endpoint    │              └─────────────┘              └─────────────┘
└─────────────┘
       │
       │Traces
       ▼
┌─────────────┐    Collect   ┌─────────────┐    Visualize ┌─────────────┐
│    Istio    │─────────────▶│   Jaeger    │◀─────────────│ Jaeger UI   │
│   Sidecar   │              └─────────────┘              └─────────────┘
└─────────────┘
```

## Deployment Architecture

### Container Orchestration (AKS)

**Kubernetes Cluster Design**
- **Node Pools**: Separate pools for different workloads
- **Namespaces**: Environment isolation (dev, staging, prod)
- **Resource Quotas**: Prevent resource starvation
- **Network Policies**: Micro-segmentation

**Service Mesh (Istio)**
- **Traffic Management**: Load balancing, circuit breaking
- **Security**: mTLS, RBAC policies
- **Observability**: Automatic metrics and tracing

### Deployment Strategy

**Blue-Green Deployment**
```
┌─────────────┐    100% Traffic  ┌─────────────┐
│   Blue      │◀─────────────────│ Load        │
│ (Current)   │                  │ Balancer    │
└─────────────┘                  └─────────────┘
                                        │
┌─────────────┐    0% Traffic           │
│   Green     │◀─────────────────────────┘
│ (New)       │
└─────────────┘

Step 1: Deploy new version to Green
Step 2: Test Green environment
Step 3: Switch traffic from Blue to Green
Step 4: Keep Blue as rollback option
```

## Performance Architecture

### Scalability Patterns

**Horizontal Pod Autoscaler (HPA)**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: account-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: account-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Caching Strategy**
- **Azure Redis Cache**: Session data, frequently accessed data
- **Application-level Cache**: In-memory caching for static data
- **CDN Caching**: Static assets and API responses

### Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| API Response Time | <200ms P95 | Prometheus |
| Database Query Time | <50ms P95 | Application metrics |
| Transaction Processing | <500ms P95 | Business metrics |
| System Availability | 99.99% | Uptime monitoring |

---

**Next Document**: Design Decisions - Explains WHY we chose each technology and pattern over alternatives.

**Document Status**: ✅ Complete  
**Last Updated**: December 2025  
**Review Cycle**: Monthly  
**Stakeholders**: Architecture Team, DevOps Team, Security Team