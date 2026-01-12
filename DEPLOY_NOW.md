# 🚀 Ready to Deploy! Quick Instructions

Your code is prepared and ready for deployment to GCP.

## ✅ What's Been Prepared:

1. ✅ Deployment package: `lite-crm-deploy.zip`
2. ✅ VM setup script: `vm-setup.sh` (will run on VM)
3. ✅ Configuration files updated for GCP
4. ✅ Database password fixed
5. ✅ Frontend port set to 80
6. ✅ CORS configured for your IP: 104.198.62.5

## 🎯 Your VM Details:
- **External IP**: 104.198.62.5
- **Zone**: us-central1-c
- **VM Name**: lite-crm-vm

## 📋 Deployment Steps (5 minutes):

### Step 1: Upload Code to Google Cloud Shell

1. Open **Google Cloud Shell**: https://shell.cloud.google.com
   - Or click the Cloud Shell icon (`>_`) in Google Cloud Console

2. In Cloud Shell, click the **three-dot menu** (top right) → **"Upload file"**

3. Upload: `lite-crm-deploy.zip` (from `/Users/Akash-Kumar/lite-crm/`)

### Step 2: Extract and Upload to VM

In Google Cloud Shell, run:

```bash
# Unzip
unzip lite-crm-deploy.zip -d lite-crm

# Upload to VM
gcloud compute scp --recurse lite-crm litecrm@lite-crm-vm:~/ --zone=us-central1-c

# Upload setup script
gcloud compute scp lite-crm/vm-setup.sh litecrm@lite-crm-vm:~/lite-crm/ --zone=us-central1-c
```

### Step 3: Run Setup on VM

```bash
# SSH into VM
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c

# Once connected, run setup script
cd ~/lite-crm
bash vm-setup.sh
```

**That's it!** The script will:
- ✅ Create .env file with secure secrets
- ✅ Start all Docker services
- ✅ Run database migrations
- ✅ Show you the URLs

### Step 4: Test Your Application

After setup completes, open in browser:

- **Frontend**: http://104.198.62.5
- **Backend API**: http://104.198.62.5:3000
- **n8n**: http://104.198.62.5:5678

## 🔍 Verify Deployment

Once setup is done, you can check:

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend
```

All services should show "Up" status.

## 🆘 If Something Goes Wrong

1. **Check logs**: `docker compose logs`
2. **Check service status**: `docker compose ps`
3. **Restart services**: `docker compose restart`
4. **View this guide**: Check `DEPLOY_GCP_DETAILED_GUIDE.md` for troubleshooting

## ✨ Next Steps After Deployment

1. ✅ Test creating an account
2. ✅ Test creating a lead
3. ✅ Set up n8n (first-time setup at http://104.198.62.5:5678)
4. 🌐 Set up domain (optional - instructions in `GCP_DEPLOYMENT_INSTRUCTIONS.md`)
5. 🔒 Set up SSL certificate (optional)

---

**Ready to deploy!** Follow the steps above. The entire process should take about 5-10 minutes.
