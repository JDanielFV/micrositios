#!/bin/bash
set -e

# Move directories
mv src/app/admin admin_temp
mv src/app/api api_temp

# Function to move directories back
cleanup() {
  echo "Cleaning up..."
  mv admin_temp src/app/admin
  mv api_temp src/app/api
}

# Trap EXIT signal to run cleanup function
trap cleanup EXIT

# Run the build
npm run build
