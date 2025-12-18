# Istio Service Mesh for Banking Platform

This directory contains Istio configuration for the Banking Platform, providing advanced traffic management, security, and observability features.

## Overview

Istio service mesh adds the following capabilities to our banking platform:

- **Traffic Management**: Load balancing, circuit breaking, retries, timeouts
- **Security**: mTLS, authorization policies, JWT validation
- **Observability**: Distributed tracing, metrics collection, access logging
- **Reliability**: Circuit breakers, bulkhead pattern, graceful degradation

## Quick Start

### Prerequisites

1. **Kubernetes cluster** (1.20+ recommended)
2. **kubectl** configured to access your cluster
3. **Istio CLI (istioctl)** (optional, will be downloaded by install script)
4. At least **4GB RAM** and **2 CPU cores** available for Istio components

### Install Istio

```bash
# Make install script executable
chmod +x install-istio.sh

# Install Istio with banking platform configuration
./install-istio.sh 1.20.0 demo
```

### Deploy Banking Platform with Istio

```bash
# Deploy the banking platform (this will automatically inject Istio sidecars)
cd ../helm
./deploy.sh development banking-platform install-or-upgrade

# Apply Istio configuration
cd ../istio
kubectl apply -f banking-platform/
```

## Architecture

### Service Mesh Components

```
┌─────────────────────┐    ┌─────────────────────┐
│   Istio Ingress     │    │     Kiali           │
│   Gateway           │    │   (Observability)   │
│   (External Access) │    │                     │
└─────────────────────┘    └─────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────────────────────────────────────┐
│               Banking Platform                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Account   │  │Transaction  │  │   Payment   │  │
│  │   Service   │  │   Service   │  │   Service   │  │
│  │ + Envoy     │  │ + Envoy     │  │ + Envoy     │  │
│  │   Sidecar   │  │   Sidecar   │  │   Sidecar   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│      Jaeger         │    │    Prometheus       │
│   (Tracing)         │    │   (Metrics)         │
└─────────────────────┘    └─────────────────────┘
```

### Traffic Flow

1. **External Traffic** → Istio Ingress Gateway
2. **Gateway** → VirtualService routing rules
3. **VirtualService** → Backend services (with Envoy sidecars)
4. **Envoy Sidecars** → Apply policies, collect telemetry
5. **Backend Services** → Process requests
6. **Telemetry** → Sent to Prometheus, Jaeger, and logging systems

## Configuration Files

### Core Configuration

| File | Description |
|------|-------------|
| `gateway.yaml` | Istio Gateway configuration for external access |
| `virtual-services.yaml` | Traffic routing and fault injection |
| `destination-rules.yaml` | Load balancing and circuit breaker policies |
| `security-policies.yaml` | mTLS and authorization policies |

### Advanced Features

| File | Description |
|------|-------------|
| `traffic-management.yaml` | Canary deployments, rate limiting |
| `telemetry.yaml` | Metrics, tracing, and logging configuration |
| `monitoring.yaml` | ServiceMonitors and monitoring dashboards |

### Installation

| File | Description |
|------|-------------|
| `install-istio.sh` | Automated Istio installation script |
| `README.md` | This documentation file |

## Features

### Traffic Management

**Load Balancing Algorithms**
- ROUND_ROBIN: Even distribution across instances
- LEAST_CONN: Route to least connected instance
- RANDOM: Random distribution
- PASSTHROUGH: No load balancing

**Circuit Breaker Configuration**
```yaml
circuitBreaker:
  consecutiveGatewayErrors: 3
  consecutiveServerErrors: 5
  interval: 30s
  baseEjectionTime: 60s
  maxEjectionPercent: 50
```

**Retry Policies**
```yaml
retries:
  attempts: 3
  perTryTimeout: 30s
  retryOn: gateway-error,connect-failure,refused-stream
```

### Security Features

**Mutual TLS (mTLS)**
- Automatic certificate management
- Service-to-service encryption
- Identity verification

**Authorization Policies**
- JWT token validation
- Role-based access control (RBAC)
- Service-to-service authorization

**Security Best Practices**
- Deny-all default policy
- Principle of least privilege
- JWT validation at ingress

### Observability

**Distributed Tracing**
- Request correlation across services
- Performance bottleneck identification
- Error propagation tracking

**Metrics Collection**
- Request rates and latencies
- Error rates by service
- Custom business metrics

**Access Logging**
- Structured JSON logs
- Request/response metadata
- Custom banking context

## Operations

### Monitoring Access

**Kiali (Service Mesh Dashboard)**
```bash
kubectl port-forward svc/kiali 20001:20001 -n istio-system
# Visit: http://localhost:20001
```

**Jaeger (Distributed Tracing)**
```bash
kubectl port-forward svc/jaeger 16686:16686 -n istio-system
# Visit: http://localhost:16686
```

**Grafana (Metrics Visualization)**
```bash
kubectl port-forward svc/grafana 3000:3000 -n istio-system
# Visit: http://localhost:3000
```

**Prometheus (Metrics Storage)**
```bash
kubectl port-forward svc/prometheus 9090:9090 -n istio-system
# Visit: http://localhost:9090
```

### Traffic Management Commands

**Enable Canary Deployment**
```bash
# Update VirtualService to split traffic 90/10
kubectl patch virtualservice banking-platform-canary-deployment -n banking-platform --type='merge' -p='
spec:
  http:
  - route:
    - destination:
        host: banking-platform-account-service
        subset: v1
      weight: 90
    - destination:
        host: banking-platform-account-service
        subset: v2
      weight: 10'
```

**Add Fault Injection**
```bash
# Inject 5% failure rate for testing
kubectl patch virtualservice banking-platform-api -n banking-platform --type='merge' -p='
spec:
  http:
  - fault:
      abort:
        percentage:
          value: 5
        httpStatus: 503'
```

**Update Circuit Breaker**
```bash
# Make circuit breaker more sensitive
kubectl patch destinationrule banking-platform-account-service -n banking-platform --type='merge' -p='
spec:
  trafficPolicy:
    circuitBreaker:
      consecutiveGatewayErrors: 1
      consecutiveServerErrors: 3'
```

### Security Operations

**Check mTLS Status**
```bash
istioctl authn tls-check
```

**Validate Authorization Policies**
```bash
istioctl analyze -n banking-platform
```

**Test JWT Validation**
```bash
# Test with valid JWT
curl -H "Authorization: Bearer valid-jwt-token" http://banking-platform.local/api/account

# Test without JWT (should fail)
curl http://banking-platform.local/api/account
```

### Troubleshooting

**Check Istio Configuration**
```bash
# Validate configuration
istioctl analyze

# Check proxy configuration
istioctl proxy-config cluster <pod-name> -n banking-platform

# Check authorization policies
istioctl proxy-config authz <pod-name> -n banking-platform
```

**Debug Traffic Issues**
```bash
# Check envoy access logs
kubectl logs <pod-name> -c istio-proxy -n banking-platform

# Get proxy configuration
istioctl proxy-config all <pod-name> -n banking-platform -o json

# Check certificate status
istioctl proxy-status
```

**Performance Tuning**
```bash
# Check resource usage
kubectl top pods -n istio-system

# Scale Istio components
kubectl scale deployment istiod --replicas=2 -n istio-system

# Update resource limits
kubectl patch deployment istiod -n istio-system -p='
spec:
  template:
    spec:
      containers:
      - name: discovery
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"'
```

## Banking-Specific Configuration

### Custom Headers

The configuration includes banking-specific headers for better observability:

- `x-customer-id`: Customer identifier for tracking
- `x-transaction-id`: Transaction correlation
- `x-banking-operation`: Operation type (transfer, payment, etc.)
- `x-correlation-id`: Request correlation across services

### Service-Specific Policies

**Account Service**
- Higher connection limits (sensitive operations)
- Strict security policies
- Comprehensive audit logging

**Transaction Service**
- Extended timeouts (complex operations)
- Aggressive circuit breaking
- Enhanced retry policies

**Payment Service**
- External gateway considerations
- Idempotency handling
- PCI compliance ready

**Notification Service**
- Lower resource requirements
- Relaxed timeout policies
- Async operation support

## Production Considerations

### Security Hardening

1. **Enable strict mTLS** across all services
2. **Implement fine-grained RBAC** policies
3. **Use external certificate management** (cert-manager)
4. **Enable audit logging** for compliance
5. **Regular security scanning** of service mesh

### Performance Optimization

1. **Tune resource limits** based on load testing
2. **Configure HPA** for Istio components
3. **Optimize sidecar injection** (exclude non-critical workloads)
4. **Use local rate limiting** for high-traffic endpoints
5. **Enable compression** for large responses

### Monitoring & Alerting

1. **Set up alerts** for circuit breaker trips
2. **Monitor mesh performance** metrics
3. **Track security violations**
4. **Set SLO/SLI** for banking operations
5. **Regular certificate rotation** monitoring

### Disaster Recovery

1. **Multi-cluster setup** for high availability
2. **Regular backup** of Istio configuration
3. **Graceful degradation** strategies
4. **Circuit breaker fallback** mechanisms
5. **Cross-region traffic failover**

## Integration with Banking Platform

The Istio configuration is designed to work seamlessly with:

- **Helm charts** in `/helm` directory
- **Docker containers** in `/docker` directory
- **Kubernetes deployments** via Helm
- **Monitoring stack** (Prometheus, Grafana)
- **Logging stack** (ELK)

## Next Steps

After deploying Istio:

1. **Deploy banking platform** with Helm
2. **Configure monitoring dashboards**
3. **Set up alerting rules**
4. **Implement GitOps** for configuration management
5. **Create disaster recovery** procedures