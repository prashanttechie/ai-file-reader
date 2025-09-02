# Docker Hub Deployment Guide

## Prerequisites

1. **Docker Hub Account**: Create account at [hub.docker.com](https://hub.docker.com)
2. **Docker CLI**: Installed and running
3. **Built Image**: Your log-interpreter-agent image

## Step-by-Step Guide

### 1. Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

### 2. Tag Your Image

```bash
# Replace 'yourusername' with your actual Docker Hub username
docker tag log-interpreter-agent yourusername/log-interpreter-agent:latest

# Optional: Add version tag
docker tag log-interpreter-agent yourusername/log-interpreter-agent:v1.0.0
```

### 3. Push to Docker Hub

```bash
# Push latest tag
docker push yourusername/log-interpreter-agent:latest

# Push version tag (if created)
docker push yourusername/log-interpreter-agent:v1.0.0
```

### 4. Verify Upload

Visit your Docker Hub repository:
```
https://hub.docker.com/r/yourusername/log-interpreter-agent
```

## Quick Commands

### Build and Push in One Go
```bash
# Set your Docker Hub username
export DOCKER_USERNAME=yourusername

# Build, tag, and push
docker build -t $DOCKER_USERNAME/log-interpreter-agent:latest .
docker push $DOCKER_USERNAME/log-interpreter-agent:latest
```

### Multi-Architecture Build (Recommended)
```bash
# Create and use buildx builder
docker buildx create --name multiarch --use

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 \
  -t yourusername/log-interpreter-agent:latest \
  --push .
```

## Repository Setup

### 1. Create Repository on Docker Hub
1. Go to [hub.docker.com](https://hub.docker.com)
2. Click "Create Repository"
3. Repository name: `log-interpreter-agent`
4. Description: "AI-powered log file interpreter with web UI"
5. Visibility: Public (or Private)

### 2. Add Repository Description
```markdown
# Log Interpreter Agent

AI-powered log file interpreter with modern web UI using:
- 🚀 Groq for fast LLM inference
- 📊 Pinecone for vector storage
- 🤖 LangChain framework
- 🌐 Express.js web interface

## Quick Start
```bash
docker run -p 3000:3000 yourusername/log-interpreter-agent:latest
```

Visit http://localhost:3000 to access the web interface.

## Documentation
- [GitHub Repository](https://github.com/yourusername/log-interpreter-agent)
- [Docker Guide](https://github.com/yourusername/log-interpreter-agent/blob/main/DOCKER.md)
```

## Automated Publishing

### GitHub Actions (Recommended)
Create `.github/workflows/docker-publish.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
  release:
    types: [ published ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: yourusername/log-interpreter-agent
        tags: |
          type=ref,event=branch
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
```

### Manual Scripts
Add to your `package.json`:

```json
{
  "scripts": {
    "docker:publish": "docker build -t $npm_config_username/log-interpreter-agent:latest . && docker push $npm_config_username/log-interpreter-agent:latest",
    "docker:publish-version": "docker build -t $npm_config_username/log-interpreter-agent:$npm_package_version . && docker push $npm_config_username/log-interpreter-agent:$npm_package_version"
  }
}
```

Usage:
```bash
npm run docker:publish --username=yourusername
npm run docker:publish-version --username=yourusername
```

## Best Practices

### 1. Image Optimization
```bash
# Multi-stage build for smaller images
# Use .dockerignore to exclude unnecessary files
# Use specific base image tags (not 'latest')
```

### 2. Security
```bash
# Scan for vulnerabilities
docker scout quickview

# Sign images (optional)
docker trust sign yourusername/log-interpreter-agent:latest
```

### 3. Versioning
```bash
# Use semantic versioning
docker tag log-interpreter-agent yourusername/log-interpreter-agent:1.0.0
docker tag log-interpreter-agent yourusername/log-interpreter-agent:1.0
docker tag log-interpreter-agent yourusername/log-interpreter-agent:latest
```

## Usage Examples

### Basic Usage
```bash
# Pull and run from Docker Hub
docker run -d -p 3000:3000 \
  --name log-interpreter \
  yourusername/log-interpreter-agent:latest
```

### With Environment Variables
```bash
# Run with custom configuration
docker run -d -p 3000:3000 \
  -e EMBEDDING_PROVIDER=simple \
  -e GROQ_MODEL=llama-3.3-70b-versatile \
  --name log-interpreter \
  yourusername/log-interpreter-agent:latest
```

### With Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  log-interpreter:
    image: yourusername/log-interpreter-agent:latest
    ports:
      - "3000:3000"
    environment:
      - EMBEDDING_PROVIDER=simple
    volumes:
      - ./uploads:/app/uploads
```

## Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Re-login to Docker Hub
docker logout
docker login
```

**Image Too Large**
```bash
# Check image size
docker images yourusername/log-interpreter-agent

# Optimize with multi-stage build
# Use .dockerignore properly
```

**Push Denied**
```bash
# Check repository exists on Docker Hub
# Verify you have push permissions
# Ensure correct image name format
```

### Useful Commands
```bash
# List local images
docker images

# Check image details
docker inspect yourusername/log-interpreter-agent:latest

# Remove local image
docker rmi yourusername/log-interpreter-agent:latest

# Pull from Docker Hub
docker pull yourusername/log-interpreter-agent:latest
```

## Public Repository Benefits

- ✅ Easy deployment for users
- ✅ Automated builds with CI/CD
- ✅ Version management
- ✅ Multi-architecture support
- ✅ Community access
- ✅ Download statistics
