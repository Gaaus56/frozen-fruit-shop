#!/usr/bin/env bash
# Sao lưu Postgres. Chạy từ thư mục gốc repo trên VPS, ví dụ bằng cron mỗi đêm:
#   0 2 * * * cd /opt/frozen-fruit-shop && ./deploy/backup.sh >> /var/log/ffs-backup.log 2>&1
# Giữ 14 bản gần nhất trong BACKUP_DIR. Việc đẩy lên nơi lưu trữ ngoài máy (R2/B2) thêm sau.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ffs}"
mkdir -p "$BACKUP_DIR"

set -a; . deploy/.env; set +a
FILE="$BACKUP_DIR/ffs-$(date +%Y%m%d-%H%M%S).sql.gz"

docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"

ls -1t "$BACKUP_DIR"/ffs-*.sql.gz | tail -n +15 | xargs -r rm --
echo "OK $FILE"
