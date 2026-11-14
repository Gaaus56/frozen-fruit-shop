# Build từ thư mục gốc repo:  docker build -f deploy/web.Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN NODE_ENV=development npm ci --workspace apps/web --include-workspace-root
# Build không cần API đang chạy: trang dùng dữ liệu dự phòng rồi tự làm mới (tối đa 5 phút,
# hoặc ngay khi admin sửa dữ liệu nhờ /api/revalidate).
RUN npm run build -w apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]
