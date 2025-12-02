#!/bin/bash
set -e

echo "Temporarily moving admin and api directories..."
# Move directories
mv src/app/admin admin_temp
mv src/app/api api_temp

# Function to move directories back
cleanup() {
  echo "Restoring admin and api directories..."
  mv admin_temp src/app/admin
  mv api_temp src/app/api
}

# Trap EXIT signal to run cleanup function
trap cleanup EXIT

echo "Running the build..."
# Run the build
npm run build

echo "Build finished."
