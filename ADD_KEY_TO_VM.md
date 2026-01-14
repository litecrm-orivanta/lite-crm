# Add SSH Key to VM - Quick Command

## Run this on your VM:

```bash
mkdir -p ~/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAiO0/r/wEgpB0mBLk4NgopIPhWfbuFzEIiq06Ny/sQN litecrm@orivanta.ai' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```

## After adding the key, run deployment:

```bash
./deploy-now.sh
```

Or use the interactive deployer:
```bash
./deploy.sh
```
