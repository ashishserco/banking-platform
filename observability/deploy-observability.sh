#!/bin/bash

# Deploy Complete Observability Stack for Banking Platform
# Usage: ./deploy-observability.sh [environment] [namespace]

set -e

ENVIRONMENT=${1:-development}
NAMESPACE=${2:-observability}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Deploying Banking Platform Observability Stack"
echo "Environment: $ENVIRONMENT"
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

# Function to create namespace
ensure_namespace() {
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        echo "📁 Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    else
        echo "✅ Namespace $NAMESPACE already exists"
    fi
}

# Function to deploy Elasticsearch
deploy_elasticsearch() {
    echo "📊 Deploying Elasticsearch..."
    
    # Apply configuration
    kubectl apply -f "$SCRIPT_DIR/efk/elasticsearch-config.yaml" -n "$NAMESPACE"
    
    # Deploy Elasticsearch StatefulSet
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: $NAMESPACE
spec:
  serviceName: elasticsearch
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
        ports:
        - containerPort: 9200
          name: http
        - containerPort: 9300
          name: transport
        env:
        - name: discovery.type
          value: single-node
        - name: ES_JAVA_OPTS
          value: "-Xms1g -Xmx1g"
        - name: xpack.security.enabled
          value: "false"
        volumeMounts:
        - name: config
          mountPath: /usr/share/elasticsearch/config/elasticsearch.yml
          subPath: elasticsearch.yml
        - name: data
          mountPath: /usr/share/elasticsearch/data
        resources:
          requests:
            memory: 2Gi
            cpu: 1000m
          limits:
            memory: 4Gi
            cpu: 2000m
      volumes:
      - name: config
        configMap:
          name: elasticsearch-config
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
  namespace: $NAMESPACE
spec:
  selector:
    app: elasticsearch
  ports:
  - port: 9200
    targetPort: 9200
    name: http
  - port: 9300
    targetPort: 9300
    name: transport
EOF

    echo "⏳ Waiting for Elasticsearch to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n "$NAMESPACE" --timeout=300s
    echo "✅ Elasticsearch deployed successfully"
}

# Function to deploy Kibana
deploy_kibana() {
    echo "📈 Deploying Kibana..."
    
    # Apply configuration
    kubectl apply -f "$SCRIPT_DIR/efk/kibana-config.yaml" -n "$NAMESPACE"
    
    # Deploy Kibana
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
      - name: kibana
        image: docker.elastic.co/kibana/kibana:7.17.0
        ports:
        - containerPort: 5601
        env:
        - name: ELASTICSEARCH_HOSTS
          value: "http://elasticsearch:9200"
        - name: XPACK_SECURITY_ENABLED
          value: "false"
        volumeMounts:
        - name: config
          mountPath: /usr/share/kibana/config/kibana.yml
          subPath: kibana.yml
        resources:
          requests:
            memory: 1Gi
            cpu: 500m
          limits:
            memory: 2Gi
            cpu: 1000m
      volumes:
      - name: config
        configMap:
          name: kibana-config
---
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: $NAMESPACE
spec:
  selector:
    app: kibana
  ports:
  - port: 5601
    targetPort: 5601
  type: LoadBalancer
EOF

    echo "⏳ Waiting for Kibana to be ready..."
    kubectl wait --for=condition=available deployment/kibana -n "$NAMESPACE" --timeout=300s
    echo "✅ Kibana deployed successfully"
}

# Function to deploy Fluent Bit
deploy_fluent_bit() {
    echo "📝 Deploying Fluent Bit..."
    
    # Apply configuration
    kubectl apply -f "$SCRIPT_DIR/efk/fluent-bit-config.yaml" -n "$NAMESPACE"
    
    # Deploy Fluent Bit DaemonSet
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: $NAMESPACE
spec:
  selector:
    matchLabels:
      name: fluent-bit
  template:
    metadata:
      labels:
        name: fluent-bit
    spec:
      serviceAccount: fluent-bit
      tolerations:
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:1.9.8
        imagePullPolicy: Always
        ports:
        - containerPort: 2020
        env:
        - name: FLUENT_CONF
          value: fluent-bit.conf
        - name: FLUENT_OPT
          value: ""
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
      terminationGracePeriodSeconds: 10
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: $NAMESPACE
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-read
rules:
- apiGroups: [""]
  resources:
  - namespaces
  - pods
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-read
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-read
subjects:
- kind: ServiceAccount
  name: fluent-bit
  namespace: $NAMESPACE
EOF

    echo "⏳ Waiting for Fluent Bit to be ready..."
    kubectl wait --for=condition=ready pod -l name=fluent-bit -n "$NAMESPACE" --timeout=180s
    echo "✅ Fluent Bit deployed successfully"
}

# Function to deploy Prometheus
deploy_prometheus() {
    echo "📊 Deploying Prometheus..."
    
    # Apply Prometheus configuration
    kubectl apply -f "$SCRIPT_DIR/prometheus/prometheus-config.yaml" -n "$NAMESPACE"
    kubectl apply -f "$SCRIPT_DIR/prometheus/alert-rules.yml" -n "$NAMESPACE"
    
    # Deploy Prometheus
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: $NAMESPACE
data:
  prometheus.yml: |
$(cat "$SCRIPT_DIR/prometheus/prometheus-config.yaml" | sed 's/^/    /')
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: $NAMESPACE
data:
  banking-alerts.yml: |
$(cat "$SCRIPT_DIR/prometheus/alert-rules.yml" | sed 's/^/    /')
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:v2.40.0
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus/'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=30d'
        - '--web.enable-lifecycle'
        - '--web.enable-admin-api'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus/
        - name: rules
          mountPath: /etc/prometheus/rules/
        - name: storage
          mountPath: /prometheus/
        resources:
          requests:
            memory: 2Gi
            cpu: 1000m
          limits:
            memory: 4Gi
            cpu: 2000m
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: rules
        configMap:
          name: prometheus-rules
      - name: storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: $NAMESPACE
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
  type: LoadBalancer
EOF

    echo "⏳ Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=available deployment/prometheus -n "$NAMESPACE" --timeout=300s
    echo "✅ Prometheus deployed successfully"
}

# Function to deploy Grafana
deploy_grafana() {
    echo "📊 Deploying Grafana..."
    
    # Deploy Grafana
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: grafana-credentials
  namespace: $NAMESPACE
type: Opaque
stringData:
  admin-user: admin
  admin-password: banking-platform-admin
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: $NAMESPACE
data:
  prometheus.yaml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus:9090
      isDefault: true
      access: proxy
    - name: Elasticsearch
      type: elasticsearch
      url: http://elasticsearch:9200
      access: proxy
      database: "banking-logs-*"
      jsonData:
        esVersion: 70
        timeField: "@timestamp"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: $NAMESPACE
data:
  banking-overview.json: |
$(cat "$SCRIPT_DIR/grafana/dashboards/banking-overview.json" | sed 's/^/    /')
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:9.3.2
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_USER
          valueFrom:
            secretKeyRef:
              name: grafana-credentials
              key: admin-user
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-credentials
              key: admin-password
        - name: GF_INSTALL_PLUGINS
          value: "grafana-piechart-panel"
        volumeMounts:
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
        - name: dashboards-config
          mountPath: /etc/grafana/provisioning/dashboards
        - name: dashboards
          mountPath: /var/lib/grafana/dashboards
        resources:
          requests:
            memory: 512Mi
            cpu: 250m
          limits:
            memory: 1Gi
            cpu: 500m
      volumes:
      - name: datasources
        configMap:
          name: grafana-datasources
      - name: dashboards-config
        configMap:
          name: grafana-dashboards-config
      - name: dashboards
        configMap:
          name: grafana-dashboards
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards-config
  namespace: $NAMESPACE
data:
  dashboards.yaml: |
    apiVersion: 1
    providers:
    - name: 'default'
      orgId: 1
      folder: ''
      type: file
      disableDeletion: false
      updateIntervalSeconds: 10
      options:
        path: /var/lib/grafana/dashboards
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: $NAMESPACE
spec:
  selector:
    app: grafana
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
EOF

    echo "⏳ Waiting for Grafana to be ready..."
    kubectl wait --for=condition=available deployment/grafana -n "$NAMESPACE" --timeout=300s
    echo "✅ Grafana deployed successfully"
}

# Function to configure index patterns and dashboards
configure_kibana_defaults() {
    echo "🔧 Configuring Kibana defaults..."
    
    # Wait for Kibana to be fully ready
    sleep 30
    
    # Get Kibana service IP
    KIBANA_IP=$(kubectl get svc kibana -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
    KIBANA_PORT=5601
    
    if [[ "$KIBANA_IP" == "localhost" ]]; then
        echo "ℹ️  LoadBalancer IP not available yet. Use port-forwarding to access Kibana:"
        echo "   kubectl port-forward svc/kibana 5601:5601 -n $NAMESPACE"
        echo "   Then visit: http://localhost:5601"
    else
        echo "🌐 Kibana available at: http://$KIBANA_IP:$KIBANA_PORT"
    fi
    
    echo "ℹ️  Use the following credentials:"
    echo "   Username: elastic"
    echo "   Password: (none - authentication disabled for demo)"
}

# Function to show access information
show_access_info() {
    echo ""
    echo "🎯 Observability Stack Access Information:"
    echo "=========================================="
    
    echo ""
    echo "📊 Grafana Dashboard:"
    GRAFANA_IP=$(kubectl get svc grafana -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [[ "$GRAFANA_IP" == "pending" ]]; then
        echo "   URL: kubectl port-forward svc/grafana 3000:3000 -n $NAMESPACE"
        echo "        Then visit: http://localhost:3000"
    else
        echo "   URL: http://$GRAFANA_IP:3000"
    fi
    echo "   Username: admin"
    echo "   Password: banking-platform-admin"
    
    echo ""
    echo "📈 Prometheus Metrics:"
    PROMETHEUS_IP=$(kubectl get svc prometheus -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [[ "$PROMETHEUS_IP" == "pending" ]]; then
        echo "   URL: kubectl port-forward svc/prometheus 9090:9090 -n $NAMESPACE"
        echo "        Then visit: http://localhost:9090"
    else
        echo "   URL: http://$PROMETHEUS_IP:9090"
    fi
    
    echo ""
    echo "📝 Kibana Logs:"
    KIBANA_IP=$(kubectl get svc kibana -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [[ "$KIBANA_IP" == "pending" ]]; then
        echo "   URL: kubectl port-forward svc/kibana 5601:5601 -n $NAMESPACE"
        echo "        Then visit: http://localhost:5601"
    else
        echo "   URL: http://$KIBANA_IP:5601"
    fi
    
    echo ""
    echo "🔍 Useful Commands:"
    echo "   Check pod status: kubectl get pods -n $NAMESPACE"
    echo "   View logs: kubectl logs -f deployment/grafana -n $NAMESPACE"
    echo "   Scale components: kubectl scale deployment grafana --replicas=2 -n $NAMESPACE"
}

# Main execution
main() {
    check_prerequisites
    ensure_namespace
    
    echo "🚀 Starting observability stack deployment..."
    
    # Deploy components in order
    deploy_elasticsearch
    deploy_kibana
    deploy_fluent_bit
    deploy_prometheus
    deploy_grafana
    
    # Configure defaults
    configure_kibana_defaults
    
    # Show access information
    show_access_info
    
    echo ""
    echo "✅ Observability stack deployment completed successfully!"
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Access Grafana to view pre-configured banking dashboards"
    echo "2. Access Kibana to search and analyze logs"
    echo "3. Access Prometheus to view raw metrics"
    echo "4. Deploy your banking platform to see data flowing"
}

# Run main function
main