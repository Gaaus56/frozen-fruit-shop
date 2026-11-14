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
# Docker / compose tự đánh dấu container "unhealthy" khi API hoặc kết nối database hỏng (/health chạy SELECT 1).
# Dùng fetch có sẵn của Node — image slim không có curl. Render bỏ qua dòng này (Render dùng Health Check Path riêng).
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3   CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
# Áp migration rồi mới chạy API.
CMD ["sh", "-c", "npx --workspace apps/api prisma migrate deploy && node apps/api/dist/main.js"]
