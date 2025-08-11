# =================================================================
# Dockerfile for Mealie Angular + .NET Backend
# =================================================================

# =================================================================
# Stage 1: Angular Frontend Build
# =================================================================
FROM node:20-alpine AS angular-builder

WORKDIR /app

# Copy package files for better caching
COPY mealie-angular/package*.json ./
COPY mealie-angular/angular.json ./
COPY mealie-angular/tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY mealie-angular/src ./src/
COPY mealie-angular/public ./public/

# Build Angular application for production
RUN npm run build -- --configuration production

# =================================================================
# Stage 2: .NET Backend Build
# =================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-builder

WORKDIR /app

# Copy solution and project files for better caching
COPY MealieApi/MealieApi.sln ./
COPY MealieApi/MealieApi.Domain/MealieApi.Domain.csproj ./MealieApi.Domain/
COPY MealieApi/MealieApi.Application/MealieApi.Application.csproj ./MealieApi.Application/
COPY MealieApi/MealieApi.Infrastructure/MealieApi.Infrastructure.csproj ./MealieApi.Infrastructure/
COPY MealieApi/MealieApi.WebApi/MealieApi.WebApi.csproj ./MealieApi.WebApi/
COPY MealieApi/MealieApi.Shared/MealieApi.Shared.csproj ./MealieApi.Shared/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY MealieApi/ ./

# Build and publish the application
RUN dotnet publish MealieApi.WebApi/MealieApi.WebApi.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    --self-contained false

# =================================================================
# Stage 3: Production Runtime (All-in-One)
# =================================================================
FROM nginx:alpine AS production

# Install .NET runtime and supervisor
RUN apk add --no-cache \
    supervisor \
    curl \
    ca-certificates \
    icu-libs \
    krb5-libs \
    libgcc \
    libintl \
    libssl3 \
    libstdc++ \
    zlib

# Install .NET runtime
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
RUN wget -qO- https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 9.0 --runtime aspnetcore --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

WORKDIR /app

# Copy Angular build output
COPY --from=angular-builder /app/dist/mealie-angular ./frontend/

# Copy .NET application
COPY --from=dotnet-builder /app/publish ./backend/

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Create app user and directories
RUN addgroup -g 911 -S mealie \
    && adduser -u 911 -D -S -G mealie mealie \
    && mkdir -p /app/data /var/log/supervisor \
    && chown -R mealie:mealie /app

EXPOSE 80

VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Use supervisor to run both nginx and .NET application
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
