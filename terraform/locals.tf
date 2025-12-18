# Local values for Banking Platform

locals {
  # Common tags applied to all resources
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      Owner       = "Banking Platform Team"
      Purpose     = "Enterprise Banking Microservices"
      CreatedBy   = "Terraform"
      CreatedDate = timestamp()
    },
    var.tags
  )

  # Naming convention
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Network configuration
  vnet_address_space = "10.0.0.0/16"
  aks_subnet_prefix  = "10.0.1.0/24"
  db_subnet_prefix   = "10.0.2.0/24"
  appgw_subnet_prefix = "10.0.3.0/24"

  # Service names
  services = [
    "account",
    "transaction", 
    "payment",
    "notification"
  ]

  # Database names
  databases = {
    account      = "BankingAccountsDb"
    transaction  = "BankingTransactionsDb"
    payment      = "BankingPaymentsDb"
    notification = "BankingNotificationsDb"
  }

  # Service Bus Topics
  service_bus_topics = [
    "account-events",
    "transaction-events", 
    "payment-events",
    "notification-events"
  ]

  # Key Vault secrets
  key_vault_secrets = [
    "sql-admin-password",
    "jwt-secret-key",
    "service-bus-connection-string",
    "redis-connection-string",
    "storage-account-key"
  ]

  # Environment-specific configurations
  env_config = {
    dev = {
      aks_node_count     = 2
      sql_sku_name      = "S1"
      redis_capacity    = 1
      acr_sku          = "Basic"
      backup_enabled   = false
    }
    staging = {
      aks_node_count     = 3
      sql_sku_name      = "S2"
      redis_capacity    = 1
      acr_sku          = "Standard"
      backup_enabled   = true
    }
    prod = {
      aks_node_count     = 5
      sql_sku_name      = "S4"
      redis_capacity    = 2
      acr_sku          = "Premium"
      backup_enabled   = true
    }
  }

  # Current environment configuration
  current_env = local.env_config[var.environment]
}