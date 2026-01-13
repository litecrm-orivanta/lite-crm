# Clone and Setup on VM

Since the code is now on GitHub, clone it fresh on the VM:

## On VM Terminal:

```bash
# Remove old directory (if you want fresh start)
cd ~
rm -rf lite-crm

# Clone from GitHub
git clone https://github.com/litecrm-orivanta/lite-crm.git
cd lite-crm

# Run setup script
bash vm-setup.sh
```

## Alternative: If you want to keep existing directory

```bash
cd ~/lite-crm

# Initialize git
git init
git remote add origin https://github.com/litecrm-orivanta/lite-crm.git
git fetch
git checkout -b main
git reset --hard origin/main

# Run setup
bash vm-setup.sh
```

## Recommended: Fresh Clone (Cleaner)

Just clone fresh - it's faster and cleaner:

```bash
cd ~
rm -rf lite-crm
git clone https://github.com/litecrm-orivanta/lite-crm.git
cd lite-crm
bash vm-setup.sh
```
