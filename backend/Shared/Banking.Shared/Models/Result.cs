namespace Banking.Shared.Models;

public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();

    private Result(bool isSuccess, T? data, string errorMessage, List<string>? errors = null)
    {
        IsSuccess = isSuccess;
        Data = data;
        ErrorMessage = errorMessage;
        Errors = errors ?? new List<string>();
    }

    public static Result<T> Success(T data) => new(true, data, string.Empty);
    public static Result<T> Failure(string errorMessage) => new(false, default, errorMessage);
    public static Result<T> Failure(List<string> errors) => new(false, default, string.Empty, errors);
}

public class Result
{
    public bool IsSuccess { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();

    private Result(bool isSuccess, string errorMessage, List<string>? errors = null)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
        Errors = errors ?? new List<string>();
    }

    public static Result Success() => new(true, string.Empty);
    public static Result Failure(string errorMessage) => new(false, errorMessage);
    public static Result Failure(List<string> errors) => new(false, string.Empty, errors);
}