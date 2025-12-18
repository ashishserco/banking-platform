# Variables for Banking Platform Infrastructure

variable "project_name" {
  description = "Name of the banking platform project"
  type        = string
  default     = "banking-platform"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "kubernetes_version" {
  description = "Kubernetes version for AKS"
  type        = string
  default     = "1.28.3"
}

variable "aks_node_count" {
  description = "Initial number of nodes in AKS cluster"
  type        = number
  default     = 3
  
  validation {
    condition     = var.aks_node_count >= 1 && var.aks_node_count <= 100
    error_message = "Node count must be between 1 and 100."
  }
}

variable "aks_node_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_D4s_v3"
}

variable "sql_admin_username" {
  description = "Admin username for SQL Server"
  type        = string
  default     = "bankingadmin"
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for AKS cluster"
  type        = bool
  default     = true
}

variable "min_node_count" {
  description = "Minimum number of nodes for auto-scaling"
  type        = number
  default     = 2
}

variable "max_node_count" {
  description = "Maximum number of nodes for auto-scaling"
  type        = number
  default     = 10
}

variable "enable_private_cluster" {
  description = "Enable private AKS cluster for enhanced security"
  type        = bool
  default     = true
}

variable "enable_azure_policy" {
  description = "Enable Azure Policy for AKS"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable backup for databases"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "enable_monitoring" {
  description = "Enable Azure Monitor and Log Analytics"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}

# Service Bus Configuration
variable "service_bus_sku" {
  description = "SKU for Service Bus namespace"
  type        = string
  default     = "Standard"
  
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.service_bus_sku)
    error_message = "Service Bus SKU must be Basic, Standard, or Premium."
  }
}

# Redis Configuration
variable "redis_sku_name" {
  description = "SKU name for Redis Cache"
  type        = string
  default     = "Standard"
}

variable "redis_family" {
  description = "Redis family"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Redis cache capacity"
  type        = number
  default     = 1
}

# SQL Database Configuration
variable "sql_sku_name" {
  description = "SKU name for SQL Database"
  type        = string
  default     = "S2"
}

variable "sql_max_size_gb" {
  description = "Maximum size of SQL Database in GB"
  type        = number
  default     = 250
}

# Container Registry Configuration
variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Standard"
  
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "ACR SKU must be Basic, Standard, or Premium."
  }
}

# Application Gateway Configuration
variable "appgw_sku_name" {
  description = "SKU name for Application Gateway"
  type        = string
  default     = "Standard_v2"
}

variable "appgw_sku_tier" {
  description = "SKU tier for Application Gateway"
  type        = string
  default     = "Standard_v2"
}

variable "appgw_sku_capacity" {
  description = "SKU capacity for Application Gateway"
  type        = number
  default     = 2
}