# Security Components for Banking Platform

# Key Vault for secrets management
resource "azurerm_key_vault" "main" {
  name                = "${local.name_prefix}-kv"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id          = data.azurerm_client_config.current.tenant_id
  sku_name           = "premium"  # Premium for HSM-backed keys

  # Security configuration
  enabled_for_deployment          = false
  enabled_for_disk_encryption     = true
  enabled_for_template_deployment = false
  enable_rbac_authorization       = true
  purge_protection_enabled        = var.environment == "prod" ? true : false
  soft_delete_retention_days      = 90

  # Network access
  public_network_access_enabled = var.environment == "prod" ? false : true

  # Network ACLs
  network_acls {
    default_action = var.environment == "prod" ? "Deny" : "Allow"
    bypass         = "AzureServices"
    
    virtual_network_subnet_ids = var.environment == "prod" ? [
      azurerm_subnet.aks.id,
      azurerm_subnet.database.id
    ] : []
  }

  tags = local.common_tags
}

# Key Vault access policy for current user (for initial setup)
resource "azurerm_key_vault_access_policy" "current_user" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  key_permissions = [
    "Get", "List", "Create", "Delete", "Update", "Import", "Backup", "Restore", "Recover"
  ]

  secret_permissions = [
    "Get", "List", "Set", "Delete", "Backup", "Restore", "Recover"
  ]

  certificate_permissions = [
    "Get", "List", "Create", "Delete", "Update", "Import", "Backup", "Restore", "Recover"
  ]
}

# Key Vault access policy for AKS
resource "azurerm_key_vault_access_policy" "aks" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_kubernetes_cluster.main.identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]

  key_permissions = [
    "Get", "List", "Decrypt", "Encrypt"
  ]
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  value        = random_password.sql_admin_password.result
  key_vault_id = azurerm_key_vault.main.id

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.current_user]
}

resource "azurerm_key_vault_secret" "jwt_secret_key" {
  name         = "jwt-secret-key"
  value        = random_password.admin_password.result
  key_vault_id = azurerm_key_vault.main.id

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.current_user]
}

resource "azurerm_key_vault_secret" "service_bus_connection_string" {
  name         = "service-bus-connection-string"
  value        = azurerm_servicebus_namespace_authorization_rule.send_listen.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.current_user]
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "redis-connection-string"
  value        = "${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port},password=${azurerm_redis_cache.main.primary_access_key},ssl=True,abortConnect=False"
  key_vault_id = azurerm_key_vault.main.id

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.current_user]
}

resource "azurerm_key_vault_secret" "storage_account_key" {
  name         = "storage-account-key"
  value        = azurerm_storage_account.main.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Application Insights for monitoring
resource "azurerm_application_insights" "main" {
  name                = "${local.name_prefix}-appinsights"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id       = azurerm_log_analytics_workspace.aks.id
  application_type   = "web"

  # Retention
  retention_in_days = var.environment == "prod" ? 90 : 30

  # Daily data volume cap
  daily_data_cap_in_gb                  = var.environment == "dev" ? 1 : 10
  daily_data_cap_notifications_disabled = false

  tags = local.common_tags
}

# Private endpoint for Key Vault (production)
resource "azurerm_private_endpoint" "key_vault" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "${local.name_prefix}-kv-pe"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id          = azurerm_subnet.database.id

  private_service_connection {
    name                           = "keyvault-private-connection"
    private_connection_resource_id = azurerm_key_vault.main.id
    is_manual_connection           = false
    subresource_names              = ["vault"]
  }

  tags = local.common_tags
}

# User-assigned managed identity for applications
resource "azurerm_user_assigned_identity" "banking_platform" {
  name                = "${local.name_prefix}-identity"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location

  tags = local.common_tags
}

# Role assignments for managed identity
resource "azurerm_role_assignment" "banking_platform_key_vault_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.banking_platform.principal_id
}

resource "azurerm_role_assignment" "banking_platform_storage_blob_data_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.banking_platform.principal_id
}