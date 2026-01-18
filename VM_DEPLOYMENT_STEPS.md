# Step-by-Step GCP VM Deployment Commands

Follow these commands **one at a time** on your GCP VM via SSH.

## Prerequisites
- You should be connected via SSH: `litecrm@lite-crm-vm:~$`
- Your code should be pushed to Git repository

---

## Step 1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

**Wait for completion** before proceeding.

---

## Step 2: Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

```bash
sudo sh get-docker.sh
```

```bash
sudo usermod -aG docker $USER
```

**Important:** You need to log out and back in for docker group to take effect. But we'll continue for now.

---

## Step 3: Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

```bash
docker-compose --version
```

**Expected output:** Should show docker-compose version (e.g., v2.24.0)

---

## Step 4: Install Git (if not already installed)

```bash
sudo apt install -y git
```

```bash
git --version
```

---

## Step 5: Create Application Directory

```bash
sudo mkdir -p /opt/lite-crm
```

```bash
sudo chown $USER:$USER /opt/lite-crm
```

```bash
cd /opt/lite-crm
```

---

## Step 6: Clone Repository

**Replace `YOUR_REPO_URL` with your actual Git repository URL:**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

**OR if using SSH:**

```bash
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git .
```

**After cloning, verify files:**

```bash
ls -la
```

You should see files like `docker-compose.prod.yml`, `backend/`, `frontend/`, etc.

---

## Step 7: Log Out and Back In (for Docker Group)

```bash
exit
```

**Then SSH back in:**
```bash
gcloud compute ssh lite-crm-vm --zone=YOUR_ZONE
```

**Or if using standard SSH:**
```bash
ssh litecrm@YOUR_VM_IP
```

**Verify Docker works:**

```bash
docker ps
```

Should show empty list (no error).

---

## Step 8: Navigate to Project Directory

```bash
cd /opt/lite-crm
```

---

## Step 9: Create Backend Environment File

```bash
cp backend/.env.example backend/.env
```

```bash
nano backend/.env
```

**In the editor, update these REQUIRED values:**

1. **DATABASE_URL** - Change password:
   ```
   DATABASE_URL=postgresql://litecrm:YOUR_STRONG_PASSWORD@db:5432/litecrm
   ```

2. **JWT_SECRET** - Use a strong random string (32+ characters):
   ```
   JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters
   ```

3. **FRONTEND_URL** - Your domain (or VM IP for now):
   ```
   FRONTEND_URL=https://yourdomain.com
   # OR if no domain yet:
   # FRONTEND_URL=http://YOUR_VM_IP:8080
   ```

4. **SMTP Configuration** - Your email settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=no-reply@yourdomain.com
   ```

5. **Super Admin** - Your admin credentials:
   ```
   SUPER_ADMIN_EMAIL=admin@yourdomain.com
   SUPER_ADMIN_PASSWORD=YourSecurePassword123!
   SUPER_ADMIN_NAME=Super Admin
   ```

6. **ENCRYPTION_KEY** - 32+ character random string:
   ```
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   ```

**To save in nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## Step 10: Create Root .env File for Docker Compose

```bash
nano .env
```

**Add these lines (replace YOUR_STRONG_PASSWORD and YOUR_VM_IP):**

```env
POSTGRES_DB=litecrm
POSTGRES_USER=litecrm
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
VITE_API_URL=http://YOUR_VM_IP:3000
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 11: Start Database First

```bash
docker compose -f docker-compose.prod.yml up -d db
```

**Wait 10 seconds, then check:**

```bash
docker compose -f docker-compose.prod.yml ps
```

Database should show as "Up" or "healthy".

---

## Step 12: Initialize Database Schema

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push
```

**Wait for completion.** You should see "Your database is now in sync with your Prisma schema."

---

## Step 13: Seed Super Admin

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
```

**Expected output:**
```
✅ Super admin user created/updated successfully!
📋 Super Admin Credentials:
   Email: [your email]
   Password: [your password]
```

---

## Step 14: Build and Start All Services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**This will take 5-10 minutes** as it builds Docker images.

**Watch progress:**

```bash
docker compose -f docker-compose.prod.yml logs -f
```

**Press `Ctrl + C` to stop watching logs.**

---

## Step 15: Check Service Status

```bash
docker compose -f docker-compose.prod.yml ps
```

**All services should show as "Up":**
- `lite-crm-db` - Up
- `lite-crm-backend` - Up  
- `lite-crm-frontend` - Up

---

## Step 16: Verify Services Are Running

```bash
curl http://localhost:3000
```

Should return some response (even if 404, that's OK - means backend is running).

```bash
curl http://localhost:8080
```

Should return HTML (frontend is running).

---

## Step 17: Check Logs (if needed)

```bash
docker compose -f docker-compose.prod.yml logs backend --tail 50
```

```bash
docker compose -f docker-compose.prod.yml logs frontend --tail 50
```

**Look for errors.** If you see "Nest application successfully started" in backend logs, you're good!

---

## Step 18: Access Your Application

**Get your VM's external IP:**

```bash
curl -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip
```

**Or check in GCP Console.**

**Access:**
- Frontend: `http://YOUR_VM_IP:8080`
- Backend API: `http://YOUR_VM_IP:3000`

**Login with your super admin credentials!**

---

## ✅ Deployment Complete!

Your application should now be running. If you encounter any issues, check the logs:

```bash
docker compose -f docker-compose.prod.yml logs
```

---

## 🔄 Future Updates

When you need to update the application:

```bash
cd /opt/lite-crm
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🆘 Troubleshooting

### Services not starting:
```bash
docker compose -f docker-compose.prod.yml logs
```

### Database connection issues:
```bash
# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Test database connection
docker compose -f docker-compose.prod.yml exec db psql -U litecrm -d litecrm -c "SELECT 1;"
```

### Port already in use:
```bash
sudo netstat -tulpn | grep -E ':(3000|8080|5432)'
```

### Restart services:
```bash
docker compose -f docker-compose.prod.yml restart
```
