#!/bin/bash

# Script to compress thumbnail images in place
# Compresses .jpg, .jpeg, and .png files (excludes vector files)
# Creates compressed versions with "-compressed" suffix
# Moves originals to oldNonCompressedAssets folder

set -e  # Exit on error

THUMBNAILS_DIR="static/thumbnails"
ARCHIVE_DIR="oldNonCompressedAssets"
PROJECTS_YAML="projects/projects.yaml"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Check if thumbnails directory exists
if [ ! -d "$THUMBNAILS_DIR" ]; then
    echo "Error: $THUMBNAILS_DIR directory not found"
    exit 1
fi

echo "Starting image compression..."
echo "Directory: $THUMBNAILS_DIR"
echo ""

# Track statistics
COMPRESSED_COUNT=0
SKIPPED_COUNT=0
YAML_UPDATED=0

# Function to update YAML file
update_yaml() {
    local old_filename=$1
    local new_filename=$2
    
    if [ -f "$PROJECTS_YAML" ]; then
        # Use sed to replace the filename in projects.yaml
        # This handles both /thumbnails/filename.jpg and thumbnails/filename.jpg
        if grep -q "$old_filename" "$PROJECTS_YAML"; then
            sed -i.bak "s|$old_filename|$new_filename|g" "$PROJECTS_YAML"
            rm -f "${PROJECTS_YAML}.bak"  # Remove backup file
            echo "   📝 Updated in projects.yaml"
            ((YAML_UPDATED++))
        fi
    fi
}

# Process JPG files
for f in "$THUMBNAILS_DIR"/*.jpg "$THUMBNAILS_DIR"/*.jpeg; do
    # Skip if no files match the pattern
    [ -e "$f" ] || continue
    
    # Get filename without path
    filename=$(basename "$f")
    
    # Skip if already compressed
    if [[ "$filename" == *"-compressed"* ]]; then
        echo "⏭️  Skipping already compressed: $filename"
        ((SKIPPED_COUNT++))
        continue
    fi
    
    # Get extension and base name
    extension="${filename##*.}"
    basename="${filename%.*}"
    
    # Create compressed filename
    compressed_name="${basename}-compressed.${extension}"
    compressed_path="$THUMBNAILS_DIR/$compressed_name"
    
    echo "🗜️  Compressing: $filename"
    
    # Compress the image
    magick "$f" -quality 50 -sampling-factor 4:2:0 -strip -interlace JPEG "$compressed_path"
    
    # Move original to archive
    mv "$f" "$ARCHIVE_DIR/$filename"
    
    # Update projects.yaml
    update_yaml "$filename" "$compressed_name"
    
    echo "   ✅ Created: $compressed_name"
    echo "   📁 Archived: $filename"
    ((COMPRESSED_COUNT++))
done

# Process PNG files
for f in "$THUMBNAILS_DIR"/*.png; do
    # Skip if no files match the pattern
    [ -e "$f" ] || continue
    
    # Get filename without path
    filename=$(basename "$f")
    
    # Skip if already compressed
    if [[ "$filename" == *"-compressed"* ]]; then
        echo "⏭️  Skipping already compressed: $filename"
        ((SKIPPED_COUNT++))
        continue
    fi
    
    # Get extension and base name
    extension="${filename##*.}"
    basename="${filename%.*}"
    
    # Create compressed filename
    compressed_name="${basename}-compressed.${extension}"
    compressed_path="$THUMBNAILS_DIR/$compressed_name"
    
    echo "🗜️  Compressing: $filename"
    
    # Compress PNG (convert to high-quality JPEG for better compression)
    magick "$f" -quality 50 -sampling-factor 4:2:0 -strip -interlace JPEG "$compressed_path"
    
    # Move original to archive
    mv "$f" "$ARCHIVE_DIR/$filename"
    
    # Update projects.yaml
    update_yaml "$filename" "$compressed_name"
    
    echo "   ✅ Created: $compressed_name"
    echo "   📁 Archived: $filename"
    ((COMPRESSED_COUNT++))
done

echo ""
echo "============================================"
echo "Compression complete!"
echo "  Compressed: $COMPRESSED_COUNT files"
echo "  Skipped: $SKIPPED_COUNT files"
echo "  Updated in YAML: $YAML_UPDATED references"
echo "  Originals archived in: $ARCHIVE_DIR"
echo "============================================"
