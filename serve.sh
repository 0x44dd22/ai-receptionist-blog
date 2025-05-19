#!/bin/bash

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 3000
# Fall back to Python 2 if Python 3 is not available
elif command -v python &>/dev/null; then
    echo "Starting server with Python 2..."
    python -m SimpleHTTPServer 3000
else
    echo "Error: Python is not installed"
    exit 1
fi
