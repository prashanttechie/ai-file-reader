#!/bin/bash

# Test log generator for AI File Reader Loki Dashboard
# This script generates sample logs to test the Loki dashboard

echo "🔧 Generating test logs for Loki dashboard..."

# Function to generate random log entries
generate_logs() {
    local log_level=$1
    local message=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    echo "[$timestamp] $log_level: $message"
}

# Generate various types of logs
for i in {1..20}; do
    # Info logs
    generate_logs "INFO" "📄 Processing file: document-$i.pdf"
    sleep 0.1
    
    generate_logs "INFO" "📚 Adding $((RANDOM % 10 + 1)) chunks to vector store..."
    sleep 0.1
    
    generate_logs "INFO" "✅ File processed: $((RANDOM % 10 + 1)) chunks loaded in $((RANDOM % 5 + 1)).$((RANDOM % 999))s"
    sleep 0.1
    
    # Query logs
    if [ $((i % 3)) -eq 0 ]; then
        generate_logs "INFO" "❓ Processing question: What is the summary of this document?"
        sleep 0.1
        generate_logs "INFO" "🤔 Processing question: What is the summary of this document?"
        sleep 0.1
        generate_logs "INFO" "✅ Query completed"
        sleep 0.1
    fi
    
    # Warning logs (occasionally)
    if [ $((i % 7)) -eq 0 ]; then
        generate_logs "WARN" "⚠️ High memory usage detected: $((RANDOM % 30 + 70))%"
        sleep 0.1
    fi
    
    # Error logs (rarely)
    if [ $((i % 15)) -eq 0 ]; then
        generate_logs "ERROR" "❌ Failed to process file: timeout after 30s"
        sleep 0.1
    fi
done

echo "✅ Test logs generated! Check your Loki dashboard in Grafana."
echo "🌐 Access Grafana at: http://localhost:3001"
echo "📊 Dashboard: AI File Reader - Loki Logs Dashboard"
