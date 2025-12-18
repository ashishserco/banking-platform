# Security and Compliance Guide

## Overview

This guide provides comprehensive security measures and compliance frameworks implemented in the banking platform to meet financial industry standards including PCI DSS, SOX, and banking regulations.

## 🔒 Security Architecture

### Defense in Depth Strategy

#### Network Security
```yaml
# Network security layers
perimeter_security:
  - azure_firewall
  - ddos_protection
  - web_application_firewall
  
network_segmentation:
  - virtual_networks
  - subnets
  - network_security_groups
  - application_security_groups
  
micro_segmentation:
  - kubernetes_network_policies
  - istio_security_policies
  - pod_security_policies
```

#### Application Security
```csharp
// Input validation and sanitization
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "BankingUser")]
public class AccountController : ControllerBase
{
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        // Input validation
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        // SQL injection prevention through parameterized queries
        var account = await _accountService.CreateAccountAsync(request);
        
        // Audit logging
        _auditLogger.LogAccountCreation(User.Identity.Name, account.AccountId);
        
        return Ok(account);
    }
}
```

## 💳 PCI DSS Compliance

### Payment Card Industry Requirements

#### Requirement 1: Firewall Configuration
```yaml
# Azure Network Security Groups
network_security_rules:
  inbound_rules:
    - name: "AllowHTTPS"
      priority: 100
      protocol: "TCP"
      source_port_range: "*"
      destination_port_range: "443"
      access: "Allow"
    
    - name: "DenyAll"
      priority: 4096
      protocol: "*"
      access: "Deny"
  
  outbound_rules:
    - name: "AllowPaymentGateway"
      priority: 100
      destination_address_prefix: "payment-gateway.com"
      destination_port_range: "443"
      access: "Allow"
```

#### Requirement 3: Protect Stored Cardholder Data
```sql
-- Data encryption at rest
CREATE TABLE PaymentCards (
    CardId UNIQUEIDENTIFIER PRIMARY KEY,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    CardNumberHash VARBINARY(64) NOT NULL, -- Hashed card number
    CardToken VARCHAR(32) NOT NULL, -- Tokenized reference
    LastFourDigits CHAR(4) NOT NULL,
    ExpiryMonth TINYINT ENCRYPTED WITH (
        COLUMN_ENCRYPTION_KEY = [CEK_PCI],
        ENCRYPTION_TYPE = DETERMINISTIC,
        ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
    ),
    ExpiryYear SMALLINT ENCRYPTED WITH (
        COLUMN_ENCRYPTION_KEY = [CEK_PCI],
        ENCRYPTION_TYPE = DETERMINISTIC,
        ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
    ),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

#### Requirement 4: Encrypt Transmission
```csharp
// TLS 1.3 enforcement
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<KestrelServerOptions>(options =>
    {
        options.ConfigureHttpsDefaults(httpsOptions =>
        {
            httpsOptions.SslProtocols = SslProtocols.Tls13;
            httpsOptions.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
        });
    });
}
```

## 📊 SOX Compliance

### Sarbanes-Oxley Act Requirements

#### Change Management Controls
```csharp
// Audit trail for all financial data changes
public class AuditTrailService : IAuditTrailService
{
    public async Task LogDataChangeAsync<T>(string userId, string action, T oldValue, T newValue)
    {
        var auditEntry = new AuditEntry
        {
            UserId = userId,
            Action = action,
            EntityType = typeof(T).Name,
            OldValue = JsonSerializer.Serialize(oldValue),
            NewValue = JsonSerializer.Serialize(newValue),
            Timestamp = DateTime.UtcNow,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent()
        };
        
        await _auditRepository.SaveAsync(auditEntry);
        
        // Immutable audit log
        await _blockchainAudit.RecordAsync(auditEntry);
    }
}
```

#### Access Controls and Segregation of Duties
```csharp
// Role-based access control
[Authorize(Roles = "TransactionApprover")]
public async Task<IActionResult> ApproveTransaction(Guid transactionId)
{
    var transaction = await _transactionService.GetAsync(transactionId);
    
    // Segregation of duties - approver cannot be the initiator
    if (transaction.InitiatedBy == User.Identity.Name)
    {
        return Forbid("Cannot approve your own transaction");
    }
    
    // Four-eyes principle for large amounts
    if (transaction.Amount > 10000m)
    {
        if (!await _approvalService.HasDualApprovalAsync(transactionId))
        {
            return BadRequest("Dual approval required for large transactions");
        }
    }
    
    await _transactionService.ApproveAsync(transactionId, User.Identity.Name);
    return Ok();
}
```

## 🔐 Authentication and Authorization

### Multi-Factor Authentication
```csharp
public class MfaService : IMfaService
{
    public async Task<bool> ValidateOtpAsync(string userId, string otpCode)
    {
        var user = await _userService.GetAsync(userId);
        var secretKey = await _keyVaultService.GetSecretAsync($"mfa-{userId}");
        
        var otp = new Totp(Base32Encoding.ToBytes(secretKey));
        var isValid = otp.VerifyTotp(otpCode, out long timeStepMatched, 
            VerificationWindow.RfcSpecifiedNetworkDelay);
        
        if (isValid)
        {
            await _auditLogger.LogMfaSuccessAsync(userId);
        }
        else
        {
            await _auditLogger.LogMfaFailureAsync(userId);
            await _securityService.CheckForBruteForceAsync(userId);
        }
        
        return isValid;
    }
}
```

### Session Management
```csharp
public class SecureSessionService
{
    public async Task<SessionToken> CreateSessionAsync(string userId)
    {
        var sessionId = Guid.NewGuid();
        var token = GenerateSecureToken();
        
        var session = new UserSession
        {
            SessionId = sessionId,
            UserId = userId,
            Token = HashToken(token),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
            IpAddress = GetClientIpAddress(),
            LastActivity = DateTime.UtcNow
        };
        
        await _sessionRepository.SaveAsync(session);
        
        return new SessionToken
        {
            Token = token,
            ExpiresAt = session.ExpiresAt
        };
    }
}
```

This security and compliance guide ensures the banking platform meets the highest industry standards for financial services.