# Check Backend Errors - Commands for VM

## 🔍 Step 1: Check Backend Logs for Error Details

```bash
docker compose logs backend --tail 100 | grep -i "error\|exception\|failed\|kanban" -A 5
```

## 🔍 Step 2: Check Full Backend Logs

```bash
docker compose logs backend --tail 200
```

## 🔍 Step 3: Test Kanban Endpoint Directly

```bash
# Get your auth token first (from browser DevTools -> Application -> Local Storage -> token)
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/leads/kanban
```

## 🔍 Step 4: Check if Backend is Running

```bash
docker compose ps backend
docker compose exec backend sh -c "ps aux | grep node"
```

## 🔍 Step 5: Check Backend Code is Updated

```bash
docker compose exec backend sh -c "grep -r 'getKanbanView' src/leads/"
```

## 🔍 Step 6: Restart Backend and Watch Logs

```bash
docker compose restart backend && sleep 3 && docker compose logs backend --tail 50 -f
```
