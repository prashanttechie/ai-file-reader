# Troubleshooting Guide

## Common Issues and Solutions

### 1. Decommissioned Groq Model Error

**Error:** `The model 'llama3-8b-8192' or 'llama3-70b-8192' has been decommissioned and is no longer supported`

**Solution:**
```bash
# Update your .env file or environment variable
GROQ_MODEL=llama-3.1-70b-versatile
```

**Current supported models (Dec 2024):**
- `llama-3.1-70b-versatile` (recommended)
- `llama-3.1-8b-instant` (faster)
- `mixtral-8x7b-32768` (larger context)
- `gemma2-9b-it` (Google's updated model)

See [MODEL-UPDATE.md](./MODEL-UPDATE.md) for detailed instructions.

### 2. HuggingFace Embeddings Error

**Error:** `Cannot find package '@xenova/transformers'`

**Solution:**
```bash
npm install @xenova/transformers
```

**Or use the simple embedding fallback:**
```bash
EMBEDDING_PROVIDER=simple npm run free-demo
```

### 2. Missing API Keys

**Error:** `Missing required environment variables`

**Solutions:**

#### For FREE mode (no OpenAI key):
```bash
# .env file
GROQ_API_KEY=your_groq_key_here
PINECONE_API_KEY=your_pinecone_key_here
EMBEDDING_PROVIDER=huggingface
```

#### For testing/development:
```bash
# .env file
GROQ_API_KEY=your_groq_key_here
PINECONE_API_KEY=your_pinecone_key_here
EMBEDDING_PROVIDER=simple
```

### 3. Pinecone Index Issues

**Error:** `Vector dimension X does not match the dimension of the index Y`

This happens when you switch between embedding providers with different dimensions.

**✅ Automatic Fix (Recommended):**
The agent now automatically handles this! It creates provider-specific indexes:
- `log-interpreter-index-openai` (1536D) for OpenAI embeddings
- `log-interpreter-index-hf` (384D) for HuggingFace embeddings  
- `log-interpreter-index-simple` (384D) for simple embeddings

**Manual Fix (if needed):**
```bash
# Set a specific index name to override auto-naming
PINECONE_INDEX_NAME=my-custom-index-name
```

**Dimension Reference:**
- OpenAI: 1536 dimensions
- HuggingFace: 384 dimensions  
- Simple: 384 dimensions

### 4. Model Download Issues

**Error:** HuggingFace model download fails

**Solutions:**

1. **Check internet connection** - first run downloads ~25MB
2. **Clear cache and retry:**
   ```bash
   rm -rf ~/.cache/huggingface/
   ```
3. **Use simple embeddings as fallback:**
   ```bash
   EMBEDDING_PROVIDER=simple npm start
   ```

### 5. Performance Issues

#### Slow first run with HuggingFace
- **Normal:** First run downloads model (~25MB)
- **Solution:** Subsequent runs use cached model and are faster

#### Out of memory errors
- **Cause:** Large files with HuggingFace embeddings
- **Solution:** Use smaller chunk sizes or OpenAI embeddings

### 6. Installation Issues

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Package version conflicts
```bash
# Update all packages
npm update
```

## Testing Different Embedding Providers

### Test OpenAI (requires API key):
```bash
EMBEDDING_PROVIDER=openai npm run groq-demo
```

### Test HuggingFace (free):
```bash
EMBEDDING_PROVIDER=huggingface npm run free-demo
```

### Test Simple (no dependencies):
```bash
EMBEDDING_PROVIDER=simple npm start
```

## Environment Variable Reference

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `GROQ_API_KEY` | Yes | - | Get from console.groq.com |
| `PINECONE_API_KEY` | Yes | - | Get from app.pinecone.io |
| `EMBEDDING_PROVIDER` | No | `openai` | Options: `openai`, `huggingface`, `simple` |
| `OPENAI_API_KEY` | Conditional | - | Only if using OpenAI embeddings |
| `EMBEDDING_MODEL` | No | Provider-specific | See model lists below |

## Embedding Provider Details

### OpenAI (Premium)
- **Requirements:** OPENAI_API_KEY
- **Default Model:** `text-embedding-ada-002`
- **Dimensions:** 1536
- **Cost:** ~$0.0001 per 1K tokens

### HuggingFace (Free)
- **Requirements:** `@xenova/transformers` package
- **Default Model:** `Xenova/all-MiniLM-L6-v2`
- **Dimensions:** 384
- **Cost:** Free (downloads model once)

### Simple (Testing)
- **Requirements:** None
- **Model:** Deterministic fake embeddings
- **Dimensions:** 384
- **Cost:** Free
- **Note:** Suitable for testing, not production

## Quick Fix Commands

### Reset everything:
```bash
rm -rf node_modules package-lock.json ~/.cache/huggingface/
npm install
EMBEDDING_PROVIDER=simple npm start
```

### Force simple embeddings:
```bash
export EMBEDDING_PROVIDER=simple
npm run free-demo
```

### Check if dependencies are installed:
```bash
npm list @xenova/transformers
npm list @langchain/groq
```

## Getting Help

If you're still having issues:

1. **Check the error message** - it often contains the solution
2. **Try simple embeddings first** - `EMBEDDING_PROVIDER=simple`
3. **Verify API keys** - test them in other applications
4. **Check network connectivity** - for model downloads
5. **Look at the logs** - the agent provides detailed status messages

## Performance Comparison

| Provider | Setup Time | First Run | Subsequent | Quality | Cost |
|----------|------------|-----------|------------|---------|------|
| OpenAI | Instant | ~200ms | ~200ms | Excellent | $ |
| HuggingFace | 30s download | ~500ms | ~300ms | Good | Free |
| Simple | Instant | ~50ms | ~50ms | Basic | Free |

Choose based on your needs:
- **Production:** OpenAI
- **Development:** HuggingFace  
- **Testing:** Simple
