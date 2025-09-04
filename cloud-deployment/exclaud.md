# ExCloud Deployment Guide

This guide walks you through deploying the AI File Reader application on ExCloud infrastructure.

## 🔐 SSH Key Setup

### 1. Create SSH Key
```bash
ssh-keygen -t rsa -b 4096 -C "prshntmishra033@gmail.com"
```

**Note:** 
- This creates both public and private keys
- Passphrase: `pass123`
- Upload the **public key** to ExCloud SSH section
- Use this SSH key when creating your instance

### 2. Connect to Instance
```bash
ssh -i ai-experiment ubuntu@210.79.129.144
```

## 🚀 Deployment Steps

### 1. Launch ExCloud Instance
1. Launch new instance in ExCloud portal
2. Attach the SSH key created above
3. SSH into the instance using the connection command

### 2. Install Docker

#### Remove Conflicting Packages
```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

#### Set up Docker's apt Repository
```bash
# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

#### Install Docker Engine
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

**Reference:** [Docker Ubuntu Installation Guide](https://docs.docker.com/engine/install/ubuntu/)

### 3. Application Setup

#### Clone Repository
```bash
git clone <repo_url>
cd <repo_root_folder>
```

#### Environment Configuration
Create `.env` file and copy all required secrets:
```bash
nano .env
# Copy paste all environment variables and API keys
```

### 4. Docker Deployment

#### Build Application Image
```bash
sudo docker build -t log-interpreter-agent .
```

#### Option A: Simple Single Container
```bash
sudo docker run -p 3000:3000 --env-file .env log-interpreter-agent
```

#### Option B: Networked Setup with Nginx
```bash
# Create network
sudo docker network create app-network

# Run application container
sudo docker run -d \
  --name myapp \
  --network app-network \
  --env-file .env \
  log-interpreter-agent

# Run Nginx proxy
sudo docker run -d \
  --name nginx-proxy \
  --network app-network \
  -p 80:80 -p 443:443 \
  -v ~/nginx/conf.d:/etc/nginx/conf.d \
  nginx:latest
```

## 🔧 Docker Management Commands

### Check Running Containers
```bash
sudo docker ps
```

### Stop and Remove Containers

#### By Container Name
```bash
sudo docker stop myapp
sudo docker rm myapp
```

#### By Container ID
```bash
sudo docker stop 8aa4ed65b6ab
sudo docker rm 8aa4ed65b6ab
```

### View Logs
```bash
sudo docker logs myapp
sudo docker logs -f myapp  # Follow logs
```

### Restart Container
```bash
sudo docker restart myapp
```

## 📝 Notes

- Replace `<repo_url>` with your actual repository URL
- Replace `<repo_root_folder>` with your repository directory name
- Ensure all environment variables are properly set in the `.env` file
- The application will be accessible on port 3000 (or 80/443 if using Nginx proxy)
- Keep your SSH private key secure and never share the passphrase
