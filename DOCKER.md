# Docker Deployment Guide

This guide explains how to run the Log Interpreter Agent using Docker.

## 🐳 Quick Start

### Prerequisites
- Docker Engine 20.10+ 
- Docker Compose 2.0+
- API keys for Groq and Pinecone

### 1. Environment Setup

Copy the environment template:
```bash
cp docker.env.example .env
```

Edit `.env` with your API keys:
```bash
# Required
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=gcp-starter

# Optional (for OpenAI embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Run with Docker Compose (Recommended)

```bash
# Start the application
npm run docker:up

# View logs
npm run docker:logs

# Stop the application
npm run docker:down
```

### 3. Alternative: Build and Run Manually

```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

## 📋 Available Docker Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run container with .env file |
| `npm run docker:up` | Start with docker-compose (detached) |
| `npm run docker:down` | Stop docker-compose services |
| `npm run docker:logs` | View container logs |
| `npm run docker:restart` | Restart services |
| `npm run docker:clean` | Stop services and clean up |

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | *required* | Your Groq API key |
| `PINECONE_API_KEY` | *required* | Your Pinecone API key |
| `PINECONE_ENVIRONMENT` | `gcp-starter` | Pinecone environment |
| `OPENAI_API_KEY` | *optional* | For OpenAI embeddings |
| `EMBEDDING_PROVIDER` | `huggingface` | `openai`, `huggingface`, `simple` |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |
| `PINECONE_INDEX_NAME` | `log-interpreter-index` | Base Pinecone index name |
| `PORT` | `3000` | Application port |

### Volume Mounts

- `./uploads:/app/uploads` - Persists uploaded files

### Resource Limits

Default limits (configurable in docker-compose.yml):
- Memory: 512MB limit, 256MB reserved
- CPU: 0.5 core limit, 0.25 core reserved

## 🔧 Customization

### Custom Port

To run on a different port:

```bash
# Edit docker-compose.yml
ports:
  - "8080:3000"  # Host port 8080, container port 3000
```

### Resource Limits

Adjust in docker-compose.yml:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

### Additional Services

Uncomment Redis in docker-compose.yml for caching:

```yaml
redis:
  image: redis:7-alpine
  # ... (see docker-compose.yml)
```

## 🔍 Troubleshooting

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f log-interpreter-agent
```

### Access Container Shell
```bash
docker-compose exec log-interpreter-agent sh
```

### Health Check
```bash
curl http://localhost:3000/api/status
```

### Common Issues

**Port Already in Use:**
```bash
# Check what's using port 3000
lsof -ti:3000

# Use different port in docker-compose.yml
ports:
  - "3001:3000"
```

**Permission Issues:**
```bash
# Fix uploads directory permissions
sudo chown -R 1001:1001 uploads/
```

**Container Won't Start:**
```bash
# Check logs for errors
docker-compose logs log-interpreter-agent

# Verify environment variables
docker-compose config
```

## 🚀 Production Deployment

### Security Considerations

1. **Use secrets management:**
   ```bash
   # Use Docker secrets instead of .env files
   echo "your_api_key" | docker secret create groq_api_key -
   ```

2. **Network security:**
   ```yaml
   # Add to docker-compose.yml
   networks:
     log-interpreter-net:
       driver: bridge
   ```

3. **Resource monitoring:**
   ```bash
   # Monitor resource usage
   docker stats log-interpreter-agent
   ```

### Load Balancing

For multiple instances:

```yaml
# docker-compose.yml
services:
  log-interpreter-agent:
    # ... existing config
    deploy:
      replicas: 3
```

### Backup Strategy

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## 📊 Monitoring

### Health Checks

The container includes built-in health checks:
- Endpoint: `http://localhost:3000/api/status`
- Interval: 30 seconds
- Timeout: 10 seconds

### Logs

Structured logging is available:
```bash
# Real-time logs
docker-compose logs -f

# Filtered logs
docker-compose logs --since="1h" log-interpreter-agent
```

## 🔄 Updates

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
npm run docker:down
npm run docker:build
npm run docker:up
```

### Update Dependencies

```bash
# Rebuild with --no-cache
docker build --no-cache -t log-interpreter-agent .
```

## 🤝 Support

- Check logs: `npm run docker:logs`
- Health status: `curl http://localhost:3000/api/status`
- Container shell: `docker-compose exec log-interpreter-agent sh`

For more help, see the main README.md file.
