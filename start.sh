#!/bin/bash
echo "Starting AI Music Studio..."
echo "The application will open in your browser shortly."
echo "Press Ctrl+C to stop the server."
echo ""

DIR="$(cd "$(dirname "$0")" && pwd)"
node "$DIR/server.cjs"
