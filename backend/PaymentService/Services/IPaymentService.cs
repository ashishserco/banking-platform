using Banking.Shared.Models;
using PaymentService.DTOs;

namespace PaymentService.Services;

public interface IPaymentService
{
    Task<Result<PaymentDto>> ProcessPaymentAsync(ProcessPaymentRequest request);
    Task<Result<PaymentDto>> ProcessBillPaymentAsync(BillPaymentRequest request);
    Task<Result<PaymentDto>> ProcessMobileRechargeAsync(MobileRechargeRequest request);
    Task<Result<PaymentDto>> GetPaymentAsync(Guid paymentId);
    Task<Result<PaymentDto>> GetPaymentByIdempotencyKeyAsync(string idempotencyKey);
    Task<Result<List<PaymentDto>>> SearchPaymentsAsync(PaymentSearchRequest request);
    Task<Result> CancelPaymentAsync(Guid paymentId, string reason);
    Task<Result<List<PaymentDto>>> GetAccountPaymentsAsync(string accountNumber, int pageSize = 50, int pageNumber = 1);
    Task<Result<PaymentDto>> RefundPaymentAsync(Guid paymentId, string reason);
}

public interface IBeneficiaryService
{
    Task<Result<PaymentBeneficiaryDto>> CreateBeneficiaryAsync(CreateBeneficiaryRequest request);
    Task<Result<PaymentBeneficiaryDto>> GetBeneficiaryAsync(Guid beneficiaryId);
    Task<Result<List<PaymentBeneficiaryDto>>> GetBeneficiariesAsync(string? beneficiaryType = null);
    Task<Result> UpdateBeneficiaryStatusAsync(Guid beneficiaryId, bool isActive);
    Task<Result> DeleteBeneficiaryAsync(Guid beneficiaryId);
}

public interface IExternalPaymentGateway
{
    Task<Result<ExternalPaymentResponse>> ProcessPaymentAsync(ExternalPaymentRequest request);
    Task<Result<ExternalPaymentResponse>> ProcessBillPaymentAsync(ExternalBillPaymentRequest request);
    Task<Result<ExternalPaymentResponse>> ProcessMobileRechargeAsync(ExternalMobileRechargeRequest request);
    Task<Result<ExternalPaymentResponse>> RefundPaymentAsync(ExternalRefundRequest request);
    Task<Result<ExternalPaymentStatusResponse>> GetPaymentStatusAsync(string externalTransactionId);
}

// External gateway contracts
public class ExternalPaymentRequest
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string SourceAccount { get; set; } = string.Empty;
    public string DestinationAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Dictionary<string, string>? AdditionalData { get; set; }
}

public class ExternalBillPaymentRequest
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string SourceAccount { get; set; } = string.Empty;
    public string BillerId { get; set; } = string.Empty;
    public string BillNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class ExternalMobileRechargeRequest
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string SourceAccount { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
}

public class ExternalRefundRequest
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string OriginalTransactionId { get; set; } = string.Empty;
    public decimal RefundAmount { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ExternalPaymentResponse
{
    public bool IsSuccess { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // PENDING, COMPLETED, FAILED
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime ProcessedAt { get; set; }
    public Dictionary<string, string>? AdditionalData { get; set; }
}

public class ExternalPaymentStatusResponse
{
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
    public string? Description { get; set; }
}