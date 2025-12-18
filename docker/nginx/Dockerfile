# Use official Nginx image
FROM nginx:alpine

# Copy custom configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY api-gateway.conf /etc/nginx/conf.d/default.conf

# Create logs directory
RUN mkdir -p /var/log/nginx

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]