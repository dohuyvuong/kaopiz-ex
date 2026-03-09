#!/bin/sh
set -e

echo "Waiting for PostgreSQL and running migrations..."
i=0
while [ "$i" -lt 10 ]; do
  i=$((i + 1))
  if npx prisma migrate deploy; then
    echo "Migrations applied."
    break
  fi
  echo "Migration attempt $i failed, retrying in 3s..."
  sleep 3
done
if [ "$i" -eq 10 ]; then
  echo "Could not run migrations after 10 attempts."
  exit 1
fi

exec "$@"
