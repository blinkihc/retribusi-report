# ==============================================
# Stage 1: Build React Frontend
# ==============================================
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json bun.lock ./

# Install all dependencies (including devDeps for build)
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build React app
RUN bun run build

# ==============================================
# Stage 2: Production Server (Bun runtime)
# ==============================================
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy built React app from builder stage
COPY --from=builder /app/dist ./dist

# Copy server source code
COPY server ./server
COPY src/lib ./src/lib
COPY scripts ./scripts
COPY drizzle.config.ts ./
COPY tsconfig.json ./

# Create uploads directory (will be overridden by persistent volume mount)
RUN mkdir -p server/public/uploads

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start server with Bun
CMD ["bun", "run", "server/index.ts"]
