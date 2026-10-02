# Build từ thư mục gốc repo:  docker build -f deploy/api.Dockerfile .
# Giữ một stage cho đơn giản: cần cả prisma CLI (migrate deploy) và tsx (tạo admin) lúc chạy.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api ./apps/api
# npm ci chạy postinstall của root (build packages/types).
# NODE_ENV phải để "development" lúc cài để có devDependencies (nest CLI, prisma, tsx).
RUN NODE_ENV=development npm ci --workspace apps/api --include-workspace-root
RUN npx --workspace apps/api prisma generate && npm run build -w apps/api

EXPOSE 4000
# Áp migration rồi mới chạy API.
CMD ["sh", "-c", "npx --workspace apps/api prisma migrate deploy && node apps/api/dist/main.js"]
