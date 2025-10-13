#!/bin/bash

# Script to generate favicons from SVG
# First install ImageMagick: brew install imagemagick

INPUT_SVG="static/receptionist_logo_v1.svg"

echo "Generating favicons from $INPUT_SVG..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it with: brew install imagemagick"
    echo ""
    echo "Or use an online favicon generator:"
    echo "  - https://favicon.io/favicon-converter/"
    echo "  - https://realfavicongenerator.net/"
    exit 1
fi

# Use magick if available, otherwise use convert
if command -v magick &> /dev/null; then
    CONVERT="magick"
else
    CONVERT="convert"
fi

# Generate different sizes
$CONVERT "$INPUT_SVG" -resize 16x16 favicon-16x16.png
$CONVERT "$INPUT_SVG" -resize 32x32 favicon-32x32.png
$CONVERT "$INPUT_SVG" -resize 48x48 favicon-48x48.png
$CONVERT "$INPUT_SVG" -resize 180x180 apple-touch-icon.png

# Generate ICO file (multiple sizes in one file)
$CONVERT favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico

echo "✓ Generated favicon files:"
echo "  - favicon.ico"
echo "  - favicon-16x16.png"
echo "  - favicon-32x32.png"
echo "  - favicon-48x48.png"
echo "  - apple-touch-icon.png"
echo ""
echo "These files are now in your root directory and ready for Bing!"
