# Azure Service Bus for Banking Platform Messaging

# Service Bus Namespace
resource "azurerm_servicebus_namespace" "main" {
  name                = "${local.name_prefix}-servicebus"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                = var.service_bus_sku
  capacity           = var.service_bus_sku == "Premium" ? 1 : null

  # Security configuration
  zone_redundant                   = var.environment == "prod" ? true : false
  local_auth_enabled              = false  # Use Azure AD authentication
  public_network_access_enabled   = var.environment == "prod" ? false : true

  tags = local.common_tags
}

# Service Bus Topics for Banking Events
resource "azurerm_servicebus_topic" "account_events" {
  name         = "account-events"
  namespace_id = azurerm_servicebus_namespace.main.id

  # Topic configuration for banking events
  enable_partitioning = true
  max_size_in_megabytes = var.service_bus_sku == "Premium" ? 81920 : 5120
  
  # Message retention
  default_message_ttl               = "PT24H"  # 24 hours
  duplicate_detection_history_time_window = "PT10M"  # 10 minutes
  enable_duplicate_detection        = true

  # Batching for performance
  enable_batched_operations = true
  support_ordering         = true
}

resource "azurerm_servicebus_topic" "transaction_events" {
  name         = "transaction-events"
  namespace_id = azurerm_servicebus_namespace.main.id

  enable_partitioning = true
  max_size_in_megabytes = var.service_bus_sku == "Premium" ? 81920 : 5120
  
  # Longer retention for financial transactions
  default_message_ttl               = "P7D"  # 7 days
  duplicate_detection_history_time_window = "PT10M"
  enable_duplicate_detection        = true

  enable_batched_operations = true
  support_ordering         = true
}

resource "azurerm_servicebus_topic" "payment_events" {
  name         = "payment-events"
  namespace_id = azurerm_servicebus_namespace.main.id

  enable_partitioning = true
  max_size_in_megabytes = var.service_bus_sku == "Premium" ? 81920 : 5120
  
  # Extended retention for payment events
  default_message_ttl               = "P7D"  # 7 days
  duplicate_detection_history_time_window = "PT10M"
  enable_duplicate_detection        = true

  enable_batched_operations = true
  support_ordering         = true
}

resource "azurerm_servicebus_topic" "notification_events" {
  name         = "notification-events"
  namespace_id = azurerm_servicebus_namespace.main.id

  enable_partitioning = true
  max_size_in_megabytes = var.service_bus_sku == "Premium" ? 20480 : 2048  # Smaller for notifications
  
  # Standard retention for notifications
  default_message_ttl               = "PT12H"  # 12 hours
  duplicate_detection_history_time_window = "PT5M"   # 5 minutes
  enable_duplicate_detection        = true

  enable_batched_operations = true
  support_ordering         = false  # Order not critical for notifications
}

# Service Bus Subscriptions for Notification Service
resource "azurerm_servicebus_subscription" "notification_account_events" {
  name     = "notification-account-subscription"
  topic_id = azurerm_servicebus_topic.account_events.id

  max_delivery_count        = 5
  lock_duration            = "PT5M"  # 5 minutes
  enable_batched_operations = true

  # Dead lettering
  dead_lettering_on_message_expiration = true
  dead_lettering_on_filter_evaluation_error = true
}

resource "azurerm_servicebus_subscription" "notification_transaction_events" {
  name     = "notification-transaction-subscription"
  topic_id = azurerm_servicebus_topic.transaction_events.id

  max_delivery_count        = 5
  lock_duration            = "PT5M"
  enable_batched_operations = true

  dead_lettering_on_message_expiration = true
  dead_lettering_on_filter_evaluation_error = true
}

resource "azurerm_servicebus_subscription" "notification_payment_events" {
  name     = "notification-payment-subscription"
  topic_id = azurerm_servicebus_topic.payment_events.id

  max_delivery_count        = 5
  lock_duration            = "PT5M"
  enable_batched_operations = true

  dead_lettering_on_message_expiration = true
  dead_lettering_on_filter_evaluation_error = true
}

# Service Bus Authorization Rules
resource "azurerm_servicebus_namespace_authorization_rule" "send_listen" {
  name         = "banking-platform-send-listen"
  namespace_id = azurerm_servicebus_namespace.main.id

  listen = true
  send   = true
  manage = false
}

# Private endpoint for Service Bus (production)
resource "azurerm_private_endpoint" "servicebus" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "${local.name_prefix}-servicebus-pe"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id          = azurerm_subnet.database.id

  private_service_connection {
    name                           = "servicebus-private-connection"
    private_connection_resource_id = azurerm_servicebus_namespace.main.id
    is_manual_connection           = false
    subresource_names              = ["namespace"]
  }

  tags = local.common_tags
}