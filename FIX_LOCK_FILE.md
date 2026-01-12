# Fix package-lock.json Sync Issue

## Error
```
`npm ci` can only install packages when your package.json and package-lock.json are in sync.
Missing: @nestjs/config@3.3.0 from lock file
```

## Problem
The `package-lock.json` file is out of sync with `package.json` after we changed the `@nestjs/config` version.

## Solution Applied

### Changed Dockerfile
Switched from `npm ci` to `npm install` which will automatically update the lock file during build:

```dockerfile
RUN npm install --legacy-peer-deps
```

## Rebuild

Now rebuild:

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Alternative: Update Lock File Locally (Optional)

If you want to update the lock file locally first:

```bash
cd backend
npm install --legacy-peer-deps
```

This will update `package-lock.json` locally, then Docker build will be faster.

## Why This Works

- `npm install` automatically updates `package-lock.json` to match `package.json`
- `npm ci` requires exact sync and fails if they don't match
- `--legacy-peer-deps` handles the version conflict

## Expected Result

After rebuild:
- ✅ Dependencies install successfully
- ✅ Build completes
- ✅ Backend starts without errors
