# Commands to Run in Google Cloud Shell

The file `lite-crm-deploy.zip` has been uploaded to `/home/litecrm/`

## Step 1: Unzip the File

```bash
cd /home/litecrm
unzip lite-crm-deploy.zip -d lite-crm
```

## Step 2: Upload to VM

```bash
gcloud compute scp --recurse lite-crm litecrm@lite-crm-vm:~/ --zone=us-central1-c
```

This will take a few minutes (156MB upload).

## Step 3: Upload Setup Script

```bash
gcloud compute scp lite-crm/vm-setup.sh litecrm@lite-crm-vm:~/lite-crm/ --zone=us-central1-c
```

## Step 4: SSH into VM and Run Setup

```bash
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c
```

Once connected to the VM, run:

```bash
cd ~/lite-crm
bash vm-setup.sh
```

The script will:
- Create .env file
- Start Docker services
- Run migrations
- Show you the URLs

## Step 5: Test

After setup completes, open in browser:
- Frontend: http://104.198.62.5
- Backend: http://104.198.62.5:3000
- n8n: http://104.198.62.5:5678
