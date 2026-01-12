# Upload Code to VM - Step by Step

You're on the VM but code isn't uploaded yet. Follow these steps:

## Step 1: Check Current Directory

On the VM, run:
```bash
pwd
ls -la
```

## Step 2: Upload Code from Cloud Shell

**Open a NEW Cloud Shell tab/window** (keep VM SSH session open), then run:

```bash
cd /home/litecrm
unzip lite-crm-deploy.zip -d lite-crm

# Upload to VM
gcloud compute scp --recurse lite-crm litecrm@lite-crm-vm:~/ --zone=us-central1-c --project=orivanta-lite-crm

# Upload setup script
gcloud compute scp lite-crm/vm-setup.sh litecrm@lite-crm-vm:~/lite-crm/ --zone=us-central1-c --project=orivanta-lite-crm
```

## Step 3: Go Back to VM Terminal

Switch back to your VM terminal and verify:

```bash
cd ~/lite-crm
ls -la
```

You should see: `backend/`, `frontend/`, `docker-compose.yml`, etc.

## Step 4: Run Setup

```bash
cd ~/lite-crm
bash vm-setup.sh
```

This will:
- Create .env file
- Start Docker services
- Run migrations

---

## Alternative: If Code Upload Fails

If upload fails, you can manually create the structure, but it's easier to use the zip file upload method above.
