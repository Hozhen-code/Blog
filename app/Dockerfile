# 1) 빌더(선택)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true

# 2) 개발용 런타임
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true
COPY package*.json ./
# lockfile 있으면 ci, 없으면 install (안전장치)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 3) 배포용 런타임(선택)
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
