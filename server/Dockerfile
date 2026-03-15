# ═══════════════════════════════════════════════════════════════
#  Dockerfile — HTW Furniture Store API Server
#  Multi-stage build for minimal production image
# ═══════════════════════════════════════════════════════════════

# ─── Stage 1: Install dependencies ───────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production image ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R appuser:nodejs /app/uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start server
CMD ["node", "server.js"]
