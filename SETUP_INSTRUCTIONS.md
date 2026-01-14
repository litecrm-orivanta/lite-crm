# Deployment Setup Instructions

## Current Status

✅ Deployment scripts created:
- `deploy.sh` - Main deployment script
- `setup-deployment.sh` - SSH setup helper
- `DEPLOYMENT.md` - Full documentation

## Next Steps

### 1. Set Up SSH Connection

The VM IP is `10.128.0.2`, but SSH connection is currently timing out. This could mean:

**Option A: VM is on a private network (GCP internal IP)**
- If your VM is on Google Cloud Platform, you need the external IP
- Get external IP: On VM, run: `curl -s ifconfig.me`
- Or check in GCP Console → Compute Engine → VM Instances

**Option B: SSH not enabled or firewall blocking**
- Make sure SSH (port 22) is open in firewall
- On GCP: Check firewall rules allow port 22
- On VM: Check if SSH service is running: `sudo systemctl status ssh`

**Option C: Need to use external IP or VPN**
- If VM is behind a firewall, you may need to:
  - Use the external/public IP instead of internal IP
  - Connect via VPN
  - Use Google Cloud Shell or similar

### 2. Get the Correct IP Address

**On your VM, run:**
```bash
# Get external IP
curl -s ifconfig.me

# Or check all IPs
hostname -I
ip addr show
```

**Update the deployment script:**
Edit `deploy.sh` and change:
```bash
VM_HOST="10.128.0.2"  # Change to external IP if needed
```

### 3. Set Up SSH Key (One-Time)

**On your local machine:**

```bash
# Run the setup script
./setup-deployment.sh

# Or manually:
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "litecrm@orivanta.ai"

# Copy key to VM (you'll enter password once)
ssh-copy-id litecrm@10.128.0.2

# Or if using external IP:
ssh-copy-id litecrm@EXTERNAL_IP
```

### 4. Test Connection

```bash
# Test SSH connection
ssh litecrm@10.128.0.2

# If it works, you should see the VM prompt
# If it fails, check the IP address and firewall settings
```

### 5. First Deployment

Once SSH is working:

```bash
# Deploy frontend (fastest, for UI changes)
./deploy.sh
# Choose option 1 (Frontend only)

# Or deploy everything
./deploy.sh
# Choose option 3 (Both frontend + backend)
```

## Alternative: Use GCP Cloud Shell

If direct SSH doesn't work, you can use Google Cloud Shell:

1. Open Google Cloud Console
2. Click Cloud Shell icon (top right)
3. Run deployment commands there
4. Or use `gcloud compute scp` to copy files

## Alternative: Manual Git Workflow

If SSH setup is complex, use Git:

1. **On local machine:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **On VM (via GCP Console or existing SSH method):**
   ```bash
   cd ~/lite-crm
   git pull origin main
   docker compose build --no-cache frontend
   docker compose up -d frontend
   ```

## Troubleshooting

### Connection Timeout
- Check if VM is running
- Verify IP address is correct
- Check firewall rules
- Try using external IP instead of internal

### Permission Denied
- Set up SSH key: `./setup-deployment.sh`
- Or use password authentication (less secure)

### Files Not Syncing
- Check rsync is installed: `which rsync`
- Check disk space on VM: `df -h`
- Check file permissions

## Quick Commands

```bash
# Test SSH
ssh litecrm@10.128.0.2 "echo 'test'"

# Check VM status
ssh litecrm@10.128.0.2 "cd ~/lite-crm && docker compose ps"

# View logs
ssh litecrm@10.128.0.2 "cd ~/lite-crm && docker compose logs --tail 50"

# Rebuild on VM
ssh litecrm@10.128.0.2 "cd ~/lite-crm && docker compose build --no-cache frontend && docker compose up -d frontend"
```

## Need Help?

If you're stuck:
1. Check `DEPLOYMENT.md` for detailed documentation
2. Verify VM IP and SSH access
3. Check firewall/network settings
4. Consider using Git workflow as alternative
