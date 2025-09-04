#!/bin/bash

# Create a log file that Promtail can collect
LOG_FILE="/tmp/ai-file-reader.log"

echo "🔧 Generating logs to $LOG_FILE for Loki dashboard..."

# Function to generate log entries with proper format
generate_log() {
    local level=$1
    local message=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    echo "[$timestamp] $level: $message" >> "$LOG_FILE"
}

# Clear existing log file
> "$LOG_FILE"

# Generate various types of logs
for i in {1..50}; do
    # Info logs - File processing
    generate_log "INFO" "📄 Processing file: document-$i.pdf"
    generate_log "INFO" "📚 Adding $((RANDOM % 10 + 1)) chunks to vector store..."
    generate_log "INFO" "✅ File processed: $((RANDOM % 10 + 1)) chunks loaded in $((RANDOM % 5 + 1)).$((RANDOM % 999))s"
    
    # Query logs
    if [ $((i % 3)) -eq 0 ]; then
        generate_log "INFO" "❓ Processing question: What is the summary of this document?"
        generate_log "INFO" "🤔 Processing question: What is the summary of this document?"
        generate_log "INFO" "✅ Query completed"
    fi
    
    # Upload logs
    if [ $((i % 4)) -eq 0 ]; then
        generate_log "INFO" "📤 File upload started: document-$i.pdf"
        generate_log "INFO" "📊 File size: $((RANDOM % 5000 + 1000)) KB"
        generate_log "INFO" "✅ File upload completed successfully"
    fi
    
    # Warning logs (occasionally)
    if [ $((i % 7)) -eq 0 ]; then
        generate_log "WARN" "⚠️ High memory usage detected: $((RANDOM % 30 + 70))%"
    fi
    
    # Error logs (rarely)
    if [ $((i % 15)) -eq 0 ]; then
        generate_log "ERROR" "❌ Failed to process file: timeout after 30s"
    fi
    
    # Vector store operations
    if [ $((i % 5)) -eq 0 ]; then
        generate_log "INFO" "🗑️ Vector store cleared successfully"
        generate_log "INFO" "📦 Creating new Pinecone index"
        generate_log "INFO" "✅ Index created and ready"
    fi
done

echo "✅ Generated $(wc -l < "$LOG_FILE") log entries in $LOG_FILE"
echo "📋 Now copy this file to the Docker volume:"
echo "   docker cp $LOG_FILE ai-file-reader-promtail:/var/log/ai-file-reader.log"
echo ""
echo "🌐 Access Grafana at: http://localhost:3001"
echo "📊 Dashboard: AI File Reader - Loki Logs Dashboard"
