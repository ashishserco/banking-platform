# Azure Kubernetes Service (AKS) Configuration

# Log Analytics Workspace for AKS monitoring
resource "azurerm_log_analytics_workspace" "aks" {
  name                = "${local.name_prefix}-aks-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "${local.name_prefix}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${local.name_prefix}-aks"
  kubernetes_version  = var.kubernetes_version

  # Private cluster configuration for enhanced security
  private_cluster_enabled             = var.enable_private_cluster
  private_dns_zone_id                = var.enable_private_cluster ? "System" : null
  private_cluster_public_fqdn_enabled = false

  # Default node pool
  default_node_pool {
    name                 = "system"
    node_count          = var.enable_auto_scaling ? null : var.aks_node_count
    vm_size             = var.aks_node_size
    vnet_subnet_id      = azurerm_subnet.aks.id
    type                = "VirtualMachineScaleSets"
    availability_zones  = ["1", "2", "3"]
    
    # Auto-scaling configuration
    enable_auto_scaling = var.enable_auto_scaling
    min_count          = var.enable_auto_scaling ? var.min_node_count : null
    max_count          = var.enable_auto_scaling ? var.max_node_count : null

    # Node configuration
    os_disk_size_gb    = 100
    os_disk_type       = "Premium_SSD"
    
    # Security and compliance
    enable_host_encryption = true
    enable_node_public_ip  = false

    # Node pool specific tags
    node_labels = {
      "nodepool" = "system"
      "workload" = "system"
    }

    tags = local.common_tags
  }

  # System assigned managed identity
  identity {
    type = "SystemAssigned"
  }

  # Network profile
  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    dns_service_ip    = "10.1.0.10"
    service_cidr      = "10.1.0.0/16"
    load_balancer_sku = "standard"
  }

  # Azure Monitor integration
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.aks.id
  }

  # Azure Policy integration
  azure_policy_enabled = var.enable_azure_policy

  # RBAC configuration
  role_based_access_control_enabled = true

  # Azure Active Directory integration
  azure_active_directory_role_based_access_control {
    managed = true
    azure_rbac_enabled = true
  }

  # Maintenance window
  maintenance_window {
    allowed {
      day   = "Sunday"
      hours = [2, 3, 4]
    }
  }

  tags = local.common_tags

  depends_on = [
    azurerm_subnet.aks,
    azurerm_log_analytics_workspace.aks
  ]
}

# Additional node pool for banking workloads
resource "azurerm_kubernetes_cluster_node_pool" "banking_workload" {
  name                  = "banking"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size              = "Standard_D8s_v3"  # Larger instances for banking workloads
  vnet_subnet_id       = azurerm_subnet.aks.id
  availability_zones   = ["1", "2", "3"]

  # Auto-scaling for banking workloads
  enable_auto_scaling = true
  min_count          = 2
  max_count          = 15
  
  # Premium storage for banking workloads
  os_disk_size_gb = 128
  os_disk_type    = "Premium_SSD"
  
  # Security
  enable_host_encryption = true
  enable_node_public_ip  = false

  # Node taints and labels for banking workloads
  node_labels = {
    "nodepool" = "banking"
    "workload" = "banking-services"
  }

  node_taints = [
    "banking=true:NoSchedule"
  ]

  tags = merge(local.common_tags, {
    "Purpose" = "Banking Microservices"
  })
}

# Role assignments for AKS
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                           = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_network_contributor" {
  principal_id         = azurerm_kubernetes_cluster.main.identity[0].principal_id
  role_definition_name = "Network Contributor"
  scope               = azurerm_virtual_network.main.id
}