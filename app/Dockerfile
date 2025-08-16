# ---- Base ----
FROM node:20-bullseye-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# ---- Deps (cache) ----
FROM base AS deps
COPY package*.json ./
# devDependencies 포함 설치(빌드에 필요)
RUN npm ci

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next 빌드 (standalone 번들 생성)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner ----
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# standalone 산출물만 복사 (node_modules 포함된 서버 번들)
COPY --from=builder /app/.next/standalone ./
# 정적 파일
COPY --from=builder /app/.next/static ./.next/static
# public (없어도 되지만 위에서 빈 폴더 만들어 둠)
COPY --from=builder /app/public ./public

# 실행 환경
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
# (콘텐츠 경로를 쓸 예정이면) ENV CONTENT_DIR=content/posts

EXPOSE 3000
CMD ["node", "server.js"]
