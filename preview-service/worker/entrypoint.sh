#!/bin/sh
set -e

WORK_DIR="${PWD}"
echo "Working directory: $WORK_DIR"

# If running from a session directory, need to use pre-installed modules from /app
# Since the session dir is root-owned, we run vite from /app and set the base path
if [ "$WORK_DIR" != "/app" ] && [ -d "/app/node_modules" ]; then
  echo "Session mode - copying files to /app/session-work..."
  # Copy session files to a sub-directory in /app (which we can write to)
  rm -rf /app/session-work
  cp -r "$WORK_DIR" /app/session-work
  cd /app/session-work
  # Symlink node_modules from parent /app
  ln -sf /app/node_modules ./node_modules
fi

# List files for debugging
echo "Final working directory: $PWD"
echo "Contents:"
ls -la

echo "Starting Vite dev server on port 4173..."
exec npx vite --host 0.0.0.0 --port 4173
