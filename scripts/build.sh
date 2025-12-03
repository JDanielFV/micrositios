#!/bin/bash
set -e

if [ -z "$BUILD_SLUG" ]; then
  echo "Fetching available sites..."
  # Get slugs from db.json
  SLUGS=$(node -e "try { const db = require('./db.json'); console.log(db.sites.map(s => s.slug).join(' ')); } catch (e) { process.exit(1); }")

  echo "Select a site to build (type the number):"
  select opt in $SLUGS "All"; do
      if [ "$opt" = "All" ]; then
          SLUG=""
          echo "Building all sites..."
          break
      elif [ -n "$opt" ]; then
          SLUG=$opt
          echo "Building only for slug: $SLUG"
          export BUILD_SLUG=$SLUG
          break
      else
          echo "Invalid option. Try again."
      fi
  done
else
  echo "BUILD_SLUG is set to '$BUILD_SLUG'. Skipping interactive selection."
fi

# Function to move directories back
cleanup() {
  echo "Restoring directories..."
  [ -d "admin_temp" ] && mv admin_temp src/app/admin
  [ -d "api_temp" ] && mv api_temp src/app/api
}

# Trap EXIT signal to run cleanup function
trap cleanup EXIT

echo "Temporarily moving admin and api directories..."
# Move directories
mv src/app/admin admin_temp
mv src/app/api api_temp

echo "Running the build..."
# Run the build
npm run build:core

echo "Build finished."
