# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ── Stage 3: Test runner ─────────────────────────────────────────────────────
FROM node:20-alpine AS test-runner
WORKDIR /app/backend
COPY backend/package*.json ./
# Install ALL deps (includes vitest + supertest)
RUN npm ci
COPY backend/ ./
ENV GROQ_API_KEY=test-key-placeholder
ENV NODE_ENV=test
CMD ["npm", "test"]

# ── Stage 4: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./package.json
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
