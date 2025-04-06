#!/bin/bash
set -e

# Ensure logs exist
: > /var/log/nestjs.log 


echo "Running migrations..."
npm run migration:run

echo "Starting NestJS..."
exec npm run start
