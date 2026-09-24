# =========================================================================
# Stage 1: Install Composer Dependencies (Production only)
# =========================================================================
FROM composer:2 AS vendor-builder
WORKDIR /app

COPY composer.json composer.lock artisan ./
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY routes/ routes/

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

# =========================================================================
# Stage 2: Production Runtime (Lean Alpine, <100MB RAM build)
# Frontend assets are pre-compiled in public/build and copied directly.
# =========================================================================
FROM php:8.4-cli-alpine AS runtime

# Install php extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install required PHP extensions
RUN install-php-extensions \
    pdo_sqlite \
    sqlite3 \
    gd \
    intl \
    zip \
    bcmath \
    pcntl \
    opcache

WORKDIR /app

# Copy application files (includes pre-compiled public/build)
COPY . .

# Copy optimized vendor from builder stage
COPY --from=vendor-builder /app/vendor /app/vendor

# Copy and configure entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

# Create storage and database directories with write permissions
RUN mkdir -p /app/database /app/storage/framework/cache /app/storage/framework/sessions /app/storage/framework/views /app/storage/logs /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]
