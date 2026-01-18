# Lite CRM

A modern Customer Relationship Management system with native workflow automation, multi-channel messaging, and advanced analytics.

## 🚀 Quick Start

### Local Development

```bash
# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
```

### Production Deployment

See [DEPLOY_README.md](./DEPLOY_README.md) for quick deployment instructions or [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) for detailed GCP deployment guide.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [GCP Deployment](./GCP_DEPLOYMENT.md) - GCP-specific deployment guide
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL 15
- **Containerization**: Docker, Docker Compose

## 📝 Configuration

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
DATABASE_URL=postgresql://litecrm:password@db:5432/litecrm
JWT_SECRET=your-secret
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your-password
# ... see backend/.env.example for all variables
```

### Super Admin Setup

```bash
# Set credentials in backend/.env
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your-secure-password

# Run seed script
docker compose exec backend npm run seed:admin
```

## 🚢 Deployment to GCP

1. Push code to Git repository
2. Create GCP VM instance
3. Clone repository on VM
4. Configure environment variables
5. Run deployment script: `./deploy-gcp.sh`

See [DEPLOY_README.md](./DEPLOY_README.md) for detailed steps.

## 📖 Features

- ✅ Unlimited Lead Management
- ✅ Visual Workflow Automation
- ✅ Multi-Channel Messaging (WhatsApp, Telegram, SMS, Email)
- ✅ Team Collaboration
- ✅ Advanced Analytics & Reporting
- ✅ Task & Calendar Management
- ✅ Notes & Activity Timeline
- ✅ CSV Import/Export
- ✅ Custom Workflows

## 🔒 Security

- Environment variables are not committed to Git (`.gitignore` configured)
- All passwords and secrets should be in `.env` files
- Use strong passwords and secrets in production
- Enable SSL/HTTPS in production

## 📞 Support

For issues or questions, contact: support@orivanta.ai

## 📄 License

Copyright © 2024 Orivanta Labs. All rights reserved.
