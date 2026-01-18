# 🚀 Quick Deployment Reference

## Your Git Repository
```
https://github.com/litecrm-orivanta/lite-crm.git
```

## Commands to Run on GCP VM (SSH: litecrm@lite-crm-vm)

### 1. Install Docker & Git
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo apt install -y git
```

### 2. Clone Repository
```bash
sudo mkdir -p /opt/lite-crm && sudo chown $USER:$USER /opt/lite-crm
cd /opt/lite-crm
git clone https://github.com/litecrm-orivanta/lite-crm.git .
```

### 3. Log Out & Back In (for Docker group)
```bash
exit
# Then SSH back in
```

### 4. Configure Environment
```bash
cd /opt/lite-crm
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your values
nano .env  # Create root .env file
```

### 5. Deploy
```bash
cd /opt/lite-crm
docker compose -f docker-compose.prod.yml up -d db
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
docker compose -f docker-compose.prod.yml up -d --build
```

### 6. Check Status
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

---

**For detailed step-by-step instructions, see: `VM_DEPLOYMENT_STEPS.md`**
