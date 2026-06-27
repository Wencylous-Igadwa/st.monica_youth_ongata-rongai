#!/bin/sh
set -e

echo "Waiting for database..."
for i in $(seq 1 30); do
  if node -e "const c=require('net');c.createConnection({host:process.env.DB_HOST||'db',port:parseInt(process.env.DB_PORT||'3306')}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; then
    echo "Database ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

echo "Running database setup..."
node server/seed.js

echo "Starting server..."
exec node server/server.js
