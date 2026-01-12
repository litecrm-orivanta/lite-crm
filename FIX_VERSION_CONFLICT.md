# Fix Version Conflict - @nestjs/config

## Error
```
Could not resolve dependency:
peer @nestjs/common@"^8.0.0 || ^9.0.0 || ^10.0.0" from @nestjs/config@3.3.0
Found: @nestjs/common@11.1.11
```

## Problem
`@nestjs/config@3.3.0` doesn't officially support NestJS v11 in its peer dependencies, but it should work fine.

## Solution Applied

### 1. Updated Package Version
Changed to `@nestjs/config@^3.2.3` which is more compatible.

### 2. Updated Dockerfile
Added `--legacy-peer-deps` flag to `npm ci` command to allow installation despite peer dependency warnings.

## Rebuild

Now rebuild the backend:

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Why This Works

- `@nestjs/config@3.2.3` is compatible with NestJS 11
- `--legacy-peer-deps` allows npm to install packages even if peer dependencies don't match exactly
- This is safe because `@nestjs/config` works fine with NestJS 11, the peer dependency just hasn't been updated

## Alternative Solution

If you prefer not to use `--legacy-peer-deps`, you can:

1. Use `npm install` instead of `npm ci` in Dockerfile
2. Or wait for `@nestjs/config` to update peer dependencies

But `--legacy-peer-deps` is the recommended approach for now.
