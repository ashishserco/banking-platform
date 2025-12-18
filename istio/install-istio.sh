#!/bin/bash

# Install and Configure Istio for Banking Platform
# Usage: ./install-istio.sh [version] [profile]

set -e

ISTIO_VERSION=${1:-1.20.0}
ISTIO_PROFILE=${2:-demo}
NAMESPACE=${3:-istio-system}

echo "🌐 Installing Istio Service Mesh for Banking Platform"
echo "Version: $ISTIO_VERSION"
echo "Profile: $ISTIO_PROFILE"
echo "Namespace: $NAMESPACE"
echo "=============================================="

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to download and install Istio
install_istio() {
    echo "📦 Downloading Istio $ISTIO_VERSION..."
    
    if [[ ! -d "istio-$ISTIO_VERSION" ]]; then
        curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$ISTIO_VERSION sh -
    fi
    
    cd "istio-$ISTIO_VERSION"
    export PATH=$PWD/bin:$PATH
    
    echo "🚀 Installing Istio with $ISTIO_PROFILE profile..."
    istioctl install --set values.defaultRevision=default --set values.pilot.env.EXTERNAL_ISTIOD=false --skip-confirmation
    
    echo "✅ Istio installed successfully"
    cd ..
}

# Function to enable automatic sidecar injection
enable_sidecar_injection() {
    echo "💉 Enabling automatic sidecar injection for banking-platform namespace..."
    
    kubectl create namespace banking-platform --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace banking-platform istio-injection=enabled --overwrite
    
    echo "✅ Sidecar injection enabled"
}

# Function to install Istio addons
install_addons() {
    echo "🔧 Installing Istio addons..."
    
    # Install Kiali (Service Mesh Observability)
    kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-$ISTIO_VERSION/samples/addons/kiali.yaml
    
    # Install Jaeger (Distributed Tracing)
    kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-$ISTIO_VERSION/samples/addons/jaeger.yaml
    
    # Install Prometheus (Metrics)
    kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-$ISTIO_VERSION/samples/addons/prometheus.yaml
    
    # Install Grafana (Metrics Visualization)
    kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-$ISTIO_VERSION/samples/addons/grafana.yaml
    
    echo "⏳ Waiting for addons to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/kiali -n istio-system
    kubectl wait --for=condition=available --timeout=300s deployment/jaeger -n istio-system
    
    echo "✅ Istio addons installed"
}

# Function to apply banking platform Istio configuration
apply_banking_config() {
    echo "🏦 Applying banking platform Istio configuration..."
    
    # Apply VirtualServices, DestinationRules, etc.
    if [[ -d "banking-platform" ]]; then
        kubectl apply -f banking-platform/
    fi
    
    echo "✅ Banking platform Istio configuration applied"
}

# Function to verify installation
verify_installation() {
    echo "🔍 Verifying Istio installation..."
    
    istioctl version
    
    echo ""
    echo "📊 Istio Components Status:"
    kubectl get pods -n istio-system
    
    echo ""
    echo "🌐 Istio Ingress Gateway:"
    kubectl get svc istio-ingressgateway -n istio-system
    
    echo ""
    echo "📋 Istio Proxy Status:"
    istioctl proxy-status
}

# Function to show access information
show_access_info() {
    echo ""
    echo "🎯 Access Information:"
    echo "====================="
    
    echo ""
    echo "🌐 Istio Ingress Gateway:"
    export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
    export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}')
    
    echo "  Gateway URL: http://$INGRESS_HOST:$INGRESS_PORT"
    echo "  Secure URL:  https://$INGRESS_HOST:$SECURE_INGRESS_PORT"
    
    echo ""
    echo "📊 Monitoring Dashboards:"
    echo "  Kiali:      kubectl port-forward svc/kiali 20001:20001 -n istio-system"
    echo "              Then visit: http://localhost:20001"
    echo ""
    echo "  Jaeger:     kubectl port-forward svc/jaeger 16686:16686 -n istio-system"
    echo "              Then visit: http://localhost:16686"
    echo ""
    echo "  Grafana:    kubectl port-forward svc/grafana 3000:3000 -n istio-system"
    echo "              Then visit: http://localhost:3000"
    echo ""
    echo "  Prometheus: kubectl port-forward svc/prometheus 9090:9090 -n istio-system"
    echo "              Then visit: http://localhost:9090"
}

# Main execution
main() {
    check_prerequisites
    install_istio
    enable_sidecar_injection
    install_addons
    apply_banking_config
    verify_installation
    show_access_info
    
    echo ""
    echo "✅ Istio installation completed successfully!"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Deploy your banking platform: ./helm/deploy.sh development banking-platform install-or-upgrade"
    echo "2. Access Kiali dashboard to visualize service mesh"
    echo "3. Monitor traffic with Jaeger tracing"
    echo "4. Create VirtualServices for traffic management"
}

# Run main function
main