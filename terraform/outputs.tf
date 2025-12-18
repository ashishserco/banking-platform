# Outputs for Banking Platform Infrastructure

# Resource Group
output "resource_group_name" {
  description = "Name of the main resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the main resource group"
  value       = azurerm_resource_group.main.location
}

# AKS Cluster
output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "aks_cluster_id" {
  description = "ID of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.id
}

output "aks_cluster_fqdn" {
  description = "FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.fqdn
}

output "aks_cluster_private_fqdn" {
  description = "Private FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.private_fqdn
}

output "aks_node_resource_group" {
  description = "Auto-generated resource group for AKS nodes"
  value       = azurerm_kubernetes_cluster.main.node_resource_group
}

# Database
output "sql_server_name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.main.name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "database_names" {
  description = "Names of all databases"
  value = {
    account      = azurerm_mssql_database.account.name
    transaction  = azurerm_mssql_database.transaction.name
    payment      = azurerm_mssql_database.payment.name
    notification = azurerm_mssql_database.notification.name
  }
}

# Container Registry
output "container_registry_name" {
  description = "Name of the Azure Container Registry"
  value       = azurerm_container_registry.main.name
}

output "container_registry_login_server" {
  description = "Login server for the Azure Container Registry"
  value       = azurerm_container_registry.main.login_server
}

# Service Bus
output "service_bus_namespace_name" {
  description = "Name of the Service Bus namespace"
  value       = azurerm_servicebus_namespace.main.name
}

output "service_bus_namespace_hostname" {
  description = "Hostname of the Service Bus namespace"
  value       = azurerm_servicebus_namespace.main.endpoint
}

output "service_bus_topics" {
  description = "Names of Service Bus topics"
  value = {
    account_events      = azurerm_servicebus_topic.account_events.name
    transaction_events  = azurerm_servicebus_topic.transaction_events.name
    payment_events      = azurerm_servicebus_topic.payment_events.name
    notification_events = azurerm_servicebus_topic.notification_events.name
  }
}

# Redis Cache
output "redis_hostname" {
  description = "Hostname of the Redis cache"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_ssl_port" {
  description = "SSL port of the Redis cache"
  value       = azurerm_redis_cache.main.ssl_port
}

# Storage Account
output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_endpoint" {
  description = "Primary blob endpoint of the storage account"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

# Key Vault
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

# Application Insights
output "application_insights_name" {
  description = "Name of Application Insights"
  value       = azurerm_application_insights.main.name
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Managed Identity
output "managed_identity_name" {
  description = "Name of the managed identity"
  value       = azurerm_user_assigned_identity.banking_platform.name
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity"
  value       = azurerm_user_assigned_identity.banking_platform.client_id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity"
  value       = azurerm_user_assigned_identity.banking_platform.principal_id
}

# Network
output "virtual_network_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}

output "virtual_network_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "subnet_ids" {
  description = "IDs of all subnets"
  value = {
    aks                = azurerm_subnet.aks.id
    database           = azurerm_subnet.database.id
    application_gateway = azurerm_subnet.application_gateway.id
  }
}

# Connection Strings (for reference - actual secrets stored in Key Vault)
output "connection_strings_key_vault_references" {
  description = "Key Vault secret names for connection strings"
  value = {
    sql_connection           = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/sql-admin-password/)"
    service_bus_connection   = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/service-bus-connection-string/)"
    redis_connection         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/redis-connection-string/)"
    storage_connection       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/storage-account-key/)"
    jwt_secret              = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/jwt-secret-key/)"
  }
}

# Environment Configuration
output "environment_config" {
  description = "Environment-specific configuration values"
  value = {
    environment     = var.environment
    location        = var.location
    project_name    = var.project_name
    name_prefix     = local.name_prefix
    kubernetes_version = var.kubernetes_version
  }
}