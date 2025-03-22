# ============================================
# Build stage
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install required packages including bash
RUN apk add --no-cache curl unzip bash

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Install app dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy source files
COPY . .

# Build the application
RUN bun run build

# ============================================
# Production stage
# ============================================
FROM nginx:alpine AS runner

# Add non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist .

# Expose port
EXPOSE 80

# Switch to non-root user
USER appuser

# Set permissions for Nginx
RUN touch /tmp/nginx.pid && \
    chown -R appuser:appgroup /tmp/nginx.pid

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Development stage
# ============================================
FROM node:20-alpine AS dev

# Set working directory
WORKDIR /app

# Install required packages including bash
RUN apk add --no-cache curl unzip bash

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Install app dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy source files (will be overridden by volume in docker-compose)
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["bun", "run", "dev"]