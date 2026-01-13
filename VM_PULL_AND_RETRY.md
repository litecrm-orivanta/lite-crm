# Pull Latest and Retry Build on VM

The backend Dockerfile has been fixed. On the VM, run:

```bash
cd ~/lite-crm
git pull
docker compose build --no-cache backend
docker compose up -d
```

The fix adds `nest-cli.json` which is required for NestJS builds.
