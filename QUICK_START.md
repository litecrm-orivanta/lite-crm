# Quick Start - Deployment Setup

## ✅ What's Done

1. ✅ Deployment scripts created
2. ✅ SSH key generated
3. ✅ VM IP configured: `104.198.62.5`

## 🔑 Final Step: Add SSH Key to VM

**On your VM, run this command:**

```bash
mkdir -p ~/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAiO0/r/wEgpB0mBLk4NgopIPhWfbuFzEIiq06Ny/sQN litecrm@orivanta.ai' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```

**Or run this on your local machine to see the command:**
```bash
./add-ssh-key.sh
```

## 🚀 After SSH Key is Added

**Test connection:**
```bash
ssh litecrm@104.198.62.5 "echo 'SSH works!'"
```

**Deploy your changes:**
```bash
./deploy.sh
```

Choose:
- **Option 1** - Frontend only (fast, ~30 seconds)
- **Option 3** - Both frontend + backend

## 📋 Summary

- **VM IP**: `104.198.62.5`
- **SSH Key**: Already generated at `~/.ssh/id_ed25519`
- **Deploy Script**: `./deploy.sh`
- **Status**: Ready! Just need to add SSH key to VM

## 🆘 Troubleshooting

If SSH doesn't work after adding the key:
1. Check key was added: `cat ~/.ssh/authorized_keys` on VM
2. Check permissions: `ls -la ~/.ssh/` on VM
3. Check SSH service: `sudo systemctl status ssh` on VM
