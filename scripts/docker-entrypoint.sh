#!/bin/sh

# Docker entrypoint script for Log Interpreter Agent

set -e

echo "🐳 Starting Log Interpreter Agent Docker Container..."

# Ensure uploads directory exists with correct permissions
if [ ! -d "/app/uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p /app/uploads
fi

# Set correct permissions for uploads directory
echo "🔐 Setting uploads directory permissions..."
chmod 755 /app/uploads

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  Warning: GROQ_API_KEY is not set"
fi

if [ -z "$PINECONE_API_KEY" ]; then
    echo "⚠️  Warning: PINECONE_API_KEY is not set"
fi

# Print configuration info
echo "📋 Configuration:"
echo "   • Node Environment: ${NODE_ENV:-development}"
echo "   • Port: ${PORT:-3000}"
echo "   • Embedding Provider: ${EMBEDDING_PROVIDER:-huggingface}"
echo "   • Groq Model: ${GROQ_MODEL:-llama-3.3-70b-versatile}"

# Start the application
echo "🚀 Starting Log Interpreter Agent..."
exec "$@"
