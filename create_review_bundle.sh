#!/bin/bash
# Creates unison_tasks_review_bundle.zip with only important files
rm -rf .review_bundle && mkdir -p .review_bundle

rsync -av --prune-empty-dirs \
  --include='README*' \
  --include='LICENSE*' \
  --include='package.json' \
  --include='package-lock.json' \
  --include='pnpm-lock.yaml' \
  --include='yarn.lock' \
  --include='tsconfig*.json' \
  --include='vite.config.*' \
  --include='next.config.*' \
  --include='tailwind.config.*' \
  --include='postcss.config.*' \
  --include='eslint*' \
  --include='.eslintrc*' \
  --include='.prettierrc*' \
  --include='prettier*' \
  --include='.env.example' \
  --include='supabase/***' \
  --include='prisma/***' \
  --include='drizzle.config.*' \
  --include='src/***' \
  --include='public/***' \
  --include='.github/workflows/***' \
  --exclude='node_modules/***' \
  --exclude='dist/***' \
  --exclude='build/***' \
  --exclude='.next/***' \
  --exclude='.vercel/***' \
  --exclude='coverage/***' \
  --exclude='.git/***' \
  ./ .review_bundle/

cd .review_bundle && zip -r ../unison_tasks_review_bundle.zip . && cd ..
echo "Created: unison_tasks_review_bundle.zip"\n