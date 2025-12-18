# Storage Components for Banking Platform

# Storage Account for general purposes
resource "azurerm_storage_account" "main" {
  name                = "${replace(local.name_prefix, "-", "")}storage"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location

  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  account_kind            = "StorageV2"

  # Security configuration
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = true
  
  # Network access
  public_network_access_enabled = var.environment == "prod" ? false : true

  # Blob configuration
  blob_properties {
    versioning_enabled       = true
    change_feed_enabled      = true
    change_feed_retention_in_days = 30
    last_access_time_enabled = true

    delete_retention_policy {
      days = 30
    }

    container_delete_retention_policy {
      days = 30
    }
  }

  tags = local.common_tags
}

# Storage containers
resource "azurerm_storage_container" "backup" {
  name                  = "backups"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "logs" {
  name                  = "logs"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "documents" {
  name                  = "documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${replace(local.name_prefix, "-", "")}acr"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  sku                = var.acr_sku

  # Security configuration
  admin_enabled                 = false
  public_network_access_enabled = var.environment == "prod" ? false : true
  zone_redundancy_enabled       = var.environment == "prod" ? true : false

  # Image retention policy
  retention_policy {
    enabled = true
    days    = var.environment == "prod" ? 30 : 7
  }

  # Trust policy for signed images
  trust_policy {
    enabled = var.environment == "prod" ? true : false
  }

  # Quarantine policy
  quarantine_policy {
    enabled = var.environment == "prod" ? true : false
  }

  # Geo-replication for production
  dynamic "georeplications" {
    for_each = var.environment == "prod" ? ["West US 2"] : []
    content {
      location                = georeplications.value
      zone_redundancy_enabled = true
    }
  }

  tags = local.common_tags
}

# Redis Cache for session management and caching
resource "azurerm_redis_cache" "main" {
  name                = "${local.name_prefix}-redis"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity           = var.redis_capacity
  family             = var.redis_family
  sku_name           = var.redis_sku_name

  # Security configuration
  minimum_tls_version = "1.2"
  enable_non_ssl_port = false
  
  # Network configuration
  public_network_access_enabled = var.environment == "prod" ? false : true
  subnet_id                     = var.environment == "prod" ? azurerm_subnet.database.id : null

  # Redis configuration
  redis_configuration {
    enable_authentication           = true
    maxmemory_reserved             = var.redis_capacity * 50  # 50MB per GB
    maxmemory_delta                = var.redis_capacity * 50  # 50MB per GB
    maxmemory_policy               = "allkeys-lru"
    notify_keyspace_events         = "Ex"
    rdb_backup_enabled             = var.environment != "dev"
    rdb_backup_frequency           = var.environment == "prod" ? 60 : 1440  # 1 hour for prod, 24 hours for staging
    rdb_backup_max_snapshot_count  = 5
    rdb_storage_connection_string  = var.environment != "dev" ? azurerm_storage_account.main.primary_blob_connection_string : null
  }

  # Patch schedule for maintenance
  patch_schedule {
    day_of_week    = "Sunday"
    start_hour_utc = 2
  }

  tags = local.common_tags
}

# Role assignments for storage
resource "azurerm_role_assignment" "storage_account_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_mssql_server.main.identity[0].principal_id
}