#!/bin/bash

# Script to update all Vercel domain aliases to point to the latest deployment
# This ensures all your domains route to this environment's latest version

LATEST_DEPLOY="unison-tasks-gqr74eggx-unrealdev02s-projects.vercel.app"

echo "🚀 Updating all domains to point to: $LATEST_DEPLOY"
echo ""

# Main production domains
DOMAINS=(
  "unison-tasks.vercel.app"
  "unison-tasks-24334-81331.vercel.app"
)

# Update each domain alias
for domain in "${DOMAINS[@]}"; do
  echo "📍 Updating $domain..."
  vercel alias set "$LATEST_DEPLOY" "$domain" --scope unrealdev02s-projects
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully updated $domain"
  else
    echo "❌ Failed to update $domain"
  fi
  echo ""
done

echo "🎉 Domain update complete!"
echo ""
echo "Your main domains now point to the latest deployment:"
for domain in "${DOMAINS[@]}"; do
  echo "  • https://$domain"
done
echo ""
echo "Latest deployment URL:"
echo "  • https://$LATEST_DEPLOY"
