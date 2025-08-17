# ---- deps (캐시) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# lockfile이 없을 때 npm install로 우회 (EUSAGE 방지)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Next.js standalone 산출물만 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
