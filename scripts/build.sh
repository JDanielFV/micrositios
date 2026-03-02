#!/bin/bash
set -e

# Fetch available sites from db.json using bun directly
echo "Fetching available sites..."
SLUGS=$(bun -e "const db = require('./db.json'); console.log(db.sites.map(s => s.slug).join(' '));")

# Convert SLUGS to array
IFS=' ' read -r -a SLUG_ARRAY <<< "$SLUGS"

if [ -z "$BUILD_SLUG" ]; then
    echo "Select site(s) to build:"
    for i in "${!SLUG_ARRAY[@]}"; do
        printf "%2d) %s\n" $((i+1)) "${SLUG_ARRAY[$i]}"
    done
    echo " a) All sites"
    echo ""
    echo "Enter number(s) separated by commas (e.g., 1,3,4) or 'a' for all:"
    read -r CHOICE

    if [[ "$CHOICE" == "a" ]]; then
        export BUILD_SLUG="all"
        echo "Building all sites..."
    else
        # Process comma-separated choices
        IFS=',' read -r -a CHOICES <<< "$CHOICE"
        SELECTED_SLUGS=""
        for c in "${CHOICES[@]}"; do
            # Trim whitespace and convert to number
            c=$(echo "$c" | xargs)
            if [[ "$c" =~ ^[0-9]+$ ]] && [ "$c" -ge 1 ] && [ "$c" -le "${#SLUG_ARRAY[@]}" ]; then
                IDX=$((c-1))
                if [ -z "$SELECTED_SLUGS" ]; then
                    SELECTED_SLUGS="${SLUG_ARRAY[$IDX]}"
                else
                    SELECTED_SLUGS="$SELECTED_SLUGS,${SLUG_ARRAY[$IDX]}"
                fi
            else
                echo "Invalid selection: $c. Skipping."
            fi
        done

        if [ -n "$SELECTED_SLUGS" ]; then
            export BUILD_SLUG="$SELECTED_SLUGS"
            echo "Building only for slugs: $BUILD_SLUG"
        else
            echo "No valid sites selected. Exiting."
            exit 1
        fi
    fi
else
    echo "BUILD_SLUG is already set to '$BUILD_SLUG'. Proceeding."
fi

# Function to move directories back
cleanup() {
  echo "Restoring directories..."
  [ -d "admin_temp" ] && mv admin_temp src/app/admin || true
  [ -d "api_temp" ] && mv api_temp src/app/api || true
}

# Trap EXIT signal to run cleanup function
trap cleanup EXIT

echo "Temporarily moving admin and api directories..."
# Move directories if they exist
[ -d "src/app/admin" ] && mv src/app/admin admin_temp || echo "Admin directory already moved or missing."
[ -d "src/app/api" ] && mv src/app/api api_temp || echo "Api directory already moved or missing."

echo "Running the build..."
# Run the build with bun
bun run build:core

echo "Build finished."
