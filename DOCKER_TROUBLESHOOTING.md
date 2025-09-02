# Docker Troubleshooting Guide

## ONNX Runtime Issues on ARM64 (Apple Silicon)

### Problem
```
Error: Error loading shared library ld-linux-aarch64.so.1: No such file or directory
(needed by /app/node_modules/onnxruntime-node/bin/napi-v3/linux/arm64/onnxruntime_binding.node)
```

### Root Cause
HuggingFace transformers (`@xenova/transformers`) require ONNX runtime with native binaries that need specific glibc libraries not available in Alpine Linux on ARM64 architecture.

## Solutions (In Order of Reliability)

### Solution 1: Use Simple Embeddings (Recommended)
**Best for**: Development, testing, quick setup

```bash
# Already configured as default in docker-compose.yml
npm run docker:up
```

**Benefits**:
- ✅ No external dependencies
- ✅ Works on all architectures
- ✅ Fast startup
- ✅ No API keys required

**Limitations**:
- ⚠️ Less accurate semantic search
- ⚠️ Fixed dimensionality

### Solution 2: Use OpenAI Embeddings (Most Reliable)
**Best for**: Production, accuracy-critical applications

```bash
# Add OPENAI_API_KEY to your .env file
npm run docker:openai
```

**Benefits**:
- ✅ Highest accuracy
- ✅ No ONNX dependencies
- ✅ Works everywhere
- ✅ Industry standard

**Requirements**:
- 💰 Requires OpenAI API key
- 💰 Pay-per-use pricing

### Solution 3: Use Ubuntu Base Image
**Best for**: HuggingFace embeddings with better compatibility

```bash
npm run docker:build-ubuntu
npm run docker:ubuntu
```

**Benefits**:
- ✅ Full glibc support
- ✅ Better ARM64 compatibility
- ✅ Free HuggingFace embeddings

**Trade-offs**:
- ⚠️ Larger image size (~800MB vs ~200MB)
- ⚠️ Slower startup

### Solution 4: Use Debian Base Image
**Best for**: Middle ground between Alpine and Ubuntu

```bash
npm run docker:debian
```

**Benefits**:
- ✅ Better compatibility than Alpine
- ✅ Smaller than Ubuntu
- ✅ Good for HuggingFace

## Quick Fix Commands

### Check Current Status
```bash
npm run docker:status
```

### View Logs for Errors
```bash
npm run docker:logs
```

### Clean Restart
```bash
npm run docker:down
npm run docker:clean
npm run docker:up
```

### Switch Embedding Provider
```bash
# Stop current container
npm run docker:down

# Use simple embeddings (no dependencies)
EMBEDDING_PROVIDER=simple npm run docker:up

# Or use OpenAI (requires API key)
EMBEDDING_PROVIDER=openai npm run docker:up
```

## Environment Variable Solutions

### For Simple Embeddings (Default)
```bash
EMBEDDING_PROVIDER=simple
EMBEDDING_MODEL=simple
```

### For OpenAI Embeddings
```bash
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-ada-002
OPENAI_API_KEY=your_openai_api_key_here
```

### For HuggingFace Embeddings
```bash
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
```

## Architecture-Specific Workarounds

### Apple Silicon (M1/M2/M3)
1. **Recommended**: Use simple or OpenAI embeddings
2. **Alternative**: Use Ubuntu base image
3. **Avoid**: Alpine with HuggingFace embeddings

### Intel x86_64
1. All options should work
2. Alpine with HuggingFace may still have issues
3. Debian/Ubuntu base images are more reliable

## Performance Comparison

| Embedding Provider | Startup Time | Accuracy | Cost | Dependencies |
|-------------------|--------------|----------|------|--------------|
| Simple | ~5s | Medium | Free | None |
| OpenAI | ~10s | High | Paid | API Key |
| HuggingFace | ~30s | High | Free | ONNX Runtime |

## Advanced Troubleshooting

### Check ONNX Runtime Compatibility
```bash
# Inside container
node -e "console.log(process.arch, process.platform)"
ldd /app/node_modules/onnxruntime-node/bin/napi-v3/linux/arm64/onnxruntime_binding.node
```

### Force Rebuild Without Cache
```bash
docker build --no-cache -t log-interpreter-agent .
```

### Use Host Network (macOS/Linux)
```bash
docker run --network host -e EMBEDDING_PROVIDER=simple log-interpreter-agent
```

### Check Available Libraries
```bash
# Inside container
find /lib /usr/lib -name "*ld-linux*" 2>/dev/null
ldconfig -p | grep ld-linux
```

## Recommended Production Setup

```bash
# Create .env file
cat > .env << 'EOF'
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=gcp-starter
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-ada-002
GROQ_MODEL=llama-3.3-70b-versatile
NODE_ENV=production
EOF

# Deploy with OpenAI embeddings (most reliable)
npm run docker:openai
```

## Emergency Fallback

If nothing works, use local installation:

```bash
npm run docker:down
npm install
npm run ui
```

This will run the application locally without Docker, bypassing container-specific issues.
