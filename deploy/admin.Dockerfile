# Build từ thư mục gốc repo:  docker build -f deploy/admin.Dockerfile .
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin
RUN NODE_ENV=development npm ci --workspace apps/admin --include-workspace-root
RUN npm run build -w apps/admin

EXPOSE 3002
CMD ["npm", "run", "start", "-w", "apps/admin"]
