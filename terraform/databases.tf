# SQL Server and Databases for Banking Platform

# Random password for SQL Server admin
resource "random_password" "sql_admin_password" {
  length  = 20
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                = "${local.name_prefix}-sql"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  version            = "12.0"

  administrator_login          = var.sql_admin_username
  administrator_login_password = random_password.sql_admin_password.result

  # Security configuration
  minimum_tls_version = "1.2"
  
  # Azure AD authentication
  azuread_administrator {
    login_username = data.azurerm_client_config.current.client_id
    object_id      = data.azurerm_client_config.current.object_id
  }

  tags = local.common_tags
}

# SQL Server firewall rules
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Virtual network rule for database subnet
resource "azurerm_mssql_virtual_network_rule" "database_subnet" {
  name      = "database-subnet-rule"
  server_id = azurerm_mssql_server.main.id
  subnet_id = azurerm_subnet.database.id
}

# Account Service Database
resource "azurerm_mssql_database" "account" {
  name     = local.databases.account
  server_id = azurerm_mssql_server.main.id

  sku_name                    = var.sql_sku_name
  max_size_gb                = var.sql_max_size_gb
  auto_pause_delay_in_minutes = var.environment == "dev" ? 60 : -1
  min_capacity               = var.environment == "dev" ? 0.5 : 1

  # Backup and recovery
  short_term_retention_policy {
    retention_days           = 7
    backup_interval_in_hours = 12
  }

  long_term_retention_policy {
    weekly_retention  = "P4W"
    monthly_retention = "P12M"
    yearly_retention  = "P5Y"
    week_of_year     = 1
  }

  tags = merge(local.common_tags, {
    "Service" = "Account"
    "Database" = "Primary"
  })
}

# Transaction Service Database
resource "azurerm_mssql_database" "transaction" {
  name     = local.databases.transaction
  server_id = azurerm_mssql_server.main.id

  sku_name                    = var.sql_sku_name
  max_size_gb                = var.sql_max_size_gb
  auto_pause_delay_in_minutes = var.environment == "dev" ? 60 : -1
  min_capacity               = var.environment == "dev" ? 0.5 : 1

  # Enhanced backup for transaction data
  short_term_retention_policy {
    retention_days           = 14  # Longer retention for financial transactions
    backup_interval_in_hours = 6   # More frequent backups
  }

  long_term_retention_policy {
    weekly_retention  = "P8W"   # 2 months
    monthly_retention = "P24M"  # 2 years
    yearly_retention  = "P10Y"  # 10 years for compliance
    week_of_year     = 1
  }

  tags = merge(local.common_tags, {
    "Service" = "Transaction"
    "Database" = "Critical"
    "Compliance" = "Required"
  })
}

# Payment Service Database
resource "azurerm_mssql_database" "payment" {
  name     = local.databases.payment
  server_id = azurerm_mssql_server.main.id

  sku_name                    = var.sql_sku_name
  max_size_gb                = var.sql_max_size_gb
  auto_pause_delay_in_minutes = var.environment == "dev" ? 60 : -1
  min_capacity               = var.environment == "dev" ? 0.5 : 1

  # Enhanced backup for payment data
  short_term_retention_policy {
    retention_days           = 14
    backup_interval_in_hours = 6
  }

  long_term_retention_policy {
    weekly_retention  = "P8W"
    monthly_retention = "P24M"
    yearly_retention  = "P7Y"
    week_of_year     = 1
  }

  tags = merge(local.common_tags, {
    "Service" = "Payment"
    "Database" = "Critical"
    "PCI-DSS" = "Compliant"
  })
}

# Notification Service Database
resource "azurerm_mssql_database" "notification" {
  name     = local.databases.notification
  server_id = azurerm_mssql_server.main.id

  sku_name                    = var.sql_sku_name
  max_size_gb                = 100  # Smaller size for notification data
  auto_pause_delay_in_minutes = var.environment == "dev" ? 60 : -1
  min_capacity               = var.environment == "dev" ? 0.5 : 1

  # Standard backup for notification data
  short_term_retention_policy {
    retention_days           = 7
    backup_interval_in_hours = 12
  }

  long_term_retention_policy {
    weekly_retention  = "P4W"
    monthly_retention = "P6M"
    yearly_retention  = "P2Y"
    week_of_year     = 1
  }

  tags = merge(local.common_tags, {
    "Service" = "Notification"
    "Database" = "Standard"
  })
}

# SQL Database auditing
resource "azurerm_mssql_server_extended_auditing_policy" "main" {
  server_id                               = azurerm_mssql_server.main.id
  storage_endpoint                        = azurerm_storage_account.main.primary_blob_endpoint
  storage_account_access_key              = azurerm_storage_account.main.primary_access_key
  storage_account_access_key_is_secondary = false
  retention_in_days                       = 90
  
  depends_on = [
    azurerm_role_assignment.storage_account_contributor
  ]
}

# Database threat detection
resource "azurerm_mssql_server_security_alert_policy" "main" {
  resource_group_name = azurerm_resource_group.main.name
  server_name        = azurerm_mssql_server.main.name
  state              = "Enabled"
  
  storage_endpoint           = azurerm_storage_account.main.primary_blob_endpoint
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  
  email_account_admins = true
  retention_days      = 20
}