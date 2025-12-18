using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using NotificationService.Data;
using NotificationService.DTOs;
using NotificationService.Models;
using System.Text.RegularExpressions;

namespace NotificationService.Services;

public class TemplateServiceImpl : ITemplateService
{
    private readonly NotificationDbContext _context;
    private readonly ILogger<TemplateServiceImpl> _logger;
    private static readonly Regex TemplateVariableRegex = new(@"\{\{(\w+)\}\}", RegexOptions.Compiled);

    public TemplateServiceImpl(NotificationDbContext context, ILogger<TemplateServiceImpl> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<string>> RenderTemplateAsync(string templateCode, string notificationType, Dictionary<string, string> templateData, string language = "EN")
    {
        try
        {
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.TemplateCode == templateCode && 
                                         t.NotificationType == notificationType && 
                                         t.Language == language &&
                                         t.IsActive);

            if (template == null)
            {
                return Result<string>.Failure($"Template not found: {templateCode} ({notificationType}, {language})");
            }

            var renderedContent = RenderTemplate(template.ContentTemplate, templateData);
            
            _logger.LogInformation("Template rendered: {TemplateCode} for {NotificationType}", 
                templateCode, notificationType);

            return Result<string>.Success(renderedContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering template {TemplateCode}", templateCode);
            return Result<string>.Failure("Failed to render template");
        }
    }

    public async Task<Result<NotificationTemplateDto>> GetTemplateAsync(string templateCode, string notificationType, string language = "EN")
    {
        try
        {
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.TemplateCode == templateCode && 
                                         t.NotificationType == notificationType && 
                                         t.Language == language);

            if (template == null)
            {
                return Result<NotificationTemplateDto>.Failure("Template not found");
            }

            var templateDto = MapToTemplateDto(template);
            return Result<NotificationTemplateDto>.Success(templateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template {TemplateCode}", templateCode);
            return Result<NotificationTemplateDto>.Failure("Failed to retrieve template");
        }
    }

    public async Task<Result<List<NotificationTemplateDto>>> GetTemplatesAsync()
    {
        try
        {
            var templates = await _context.NotificationTemplates
                .Where(t => t.IsActive)
                .OrderBy(t => t.TemplateCode)
                .ThenBy(t => t.NotificationType)
                .ThenBy(t => t.Language)
                .ToListAsync();

            var templateDtos = templates.Select(MapToTemplateDto).ToList();
            return Result<List<NotificationTemplateDto>>.Success(templateDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving templates");
            return Result<List<NotificationTemplateDto>>.Failure("Failed to retrieve templates");
        }
    }

    private static string RenderTemplate(string template, Dictionary<string, string> data)
    {
        return TemplateVariableRegex.Replace(template, match =>
        {
            var variableName = match.Groups[1].Value;
            return data.TryGetValue(variableName, out var value) ? value : match.Value;
        });
    }

    private static NotificationTemplateDto MapToTemplateDto(NotificationTemplate template)
    {
        return new NotificationTemplateDto
        {
            TemplateId = template.TemplateId,
            TemplateCode = template.TemplateCode,
            NotificationType = template.NotificationType,
            Subject = template.Subject,
            ContentTemplate = template.ContentTemplate,
            Language = template.Language,
            IsActive = template.IsActive,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
            Description = template.Description
        };
    }
}