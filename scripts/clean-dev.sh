#!/bin/bash

echo "Cleaning up duplicate files and folders..."

# Find and remove files/folders ending in " 2" or " 2.json" etc.
# Using -print0 and xargs -0 for safe handling of filenames with spaces
find . -maxdepth 4 -name "* 2" -print0 | xargs -0 rm -rf
find . -maxdepth 4 -name "* 2.*" -print0 | xargs -0 rm -rf

echo "Cleanup complete."

echo "Starting development server..."
npm run dev
