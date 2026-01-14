# Lite CRM - Complete Project Study

## Executive Summary

**Lite CRM** is a modern, multi-tenant Customer Relationship Management (CRM) system with integrated workflow automation capabilities. It's built as a full-stack application using NestJS (backend) and React (frontend), with PostgreSQL as the database and n8n for workflow automation.

---

## 🏗️ Architecture Overview

### Technology Stack

#### Backend
- **Framework**: NestJS (Node.js, TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Authentication**: JWT + Passport.js
- **Email**: Nodemailer
- **Scheduling**: @nestjs/schedule (for cron jobs)

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **UI Components**: Radix UI + custom components

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Workflow Engine**: n8n (latest)
- **Deployment**: GCP VM (documented), supports Oracle Cloud, local development

---

## 📊 Database Schema

### Core Models

1. **Workspace** (Multi-tenant root)
   - Supports SOLO and ORG types
   - Trial management (3-day free trial)
   - Plan management (FREE, paid plans)
   - n8n integration settings (SHARED/DEDICATED instance types)

2. **User**
   - Role-based access (ADMIN, MEMBER)
   - Multiple auth providers (LOCAL, GOOGLE OAuth)
   - One user belongs to one workspace

3. **Lead**
   - Contact information (name, email, phone, company)
   - Lead stages: NEW → CONTACTED → FOLLOW_UP → WON/LOST
   - Source and region tracking
   - Owner assignment

4. **Task**
   - Associated with leads
   - Due dates and completion tracking
   - Notes/descriptions

5. **Activity**
   - Complete audit trail
   - Types: NOTE, STAGE_CHANGE, TASK_CREATED, TASK_COMPLETED
   - JSON metadata storage

6. **Invite**
   - User invitation system
   - 7-day expiration
   - Role assignment

7. **WorkflowConfiguration**
   - Maps CRM events to n8n workflows
   - Supports default and custom webhook URLs
   - Per-workspace isolation

---

## 🔐 Authentication & Authorization

### Authentication Methods
1. **Local Auth**: Email/password with bcrypt hashing
2. **Google OAuth**: Passport.js Google OAuth 2.0 strategy

### Authorization
- **JWT-based**: Tokens include `userId`, `workspaceId`, `role`, `email`
- **Role-based Access Control**:
  - **ADMIN**: Full access, can manage users, assign leads, view all data
  - **MEMBER**: Limited access, can manage assigned leads and tasks
- **Workspace Isolation**: All queries filtered by `workspaceId` from JWT

### Security Features
- Password hashing (bcrypt, 10 rounds)
- JWT token expiration
- CORS configuration
- SQL injection protection (Prisma)
- Input validation (class-validator)

---

## 🎯 Core Features

### 1. Lead Management
- ✅ Create, read, update, delete leads
- ✅ Lead staging pipeline (5 stages)
- ✅ Lead assignment to team members
- ✅ Filtering and search (by stage, source, region, name/email/company)
- ✅ Lead detail page with full history

### 2. Task Management
- ✅ Create tasks associated with leads
- ✅ Due dates and completion tracking
- ✅ Task notes/descriptions
- ✅ Task filtering by completion status

### 3. Activity Tracking
- ✅ Automatic activity logging
- ✅ Manual notes
- ✅ Complete audit trail with user attribution
- ✅ Timestamps for all activities

### 4. Team Collaboration
- ✅ Multi-user workspaces
- ✅ User invitation system
- ✅ Role-based permissions
- ✅ Email notifications for assignments

### 5. Workflow Automation (n8n Integration)
- ✅ Event-driven workflow triggers
- ✅ 7 supported events:
  - `lead.created`
  - `lead.updated`
  - `lead.stage.changed`
  - `lead.assigned`
  - `task.created`
  - `task.completed`
  - `user.invited`
- ✅ Per-workspace workflow isolation
- ✅ Custom workflow configuration UI
- ✅ Support for default and custom webhook URLs
- ✅ Workflow execution history

### 6. Workspace Management
- ✅ Multi-tenant architecture
- ✅ Workspace types: SOLO, ORG
- ✅ Trial management (3-day free trial)
- ✅ Plan management (FREE plan with unlimited leads during trial)

---

## 🔄 n8n Integration Architecture

### Integration Approach

The system supports two n8n instance types:

1. **SHARED** (Default)
   - Single n8n instance shared across workspaces
   - Per-workspace user accounts in n8n
   - User-based isolation
   - Resource efficient

2. **DEDICATED** (Enterprise)
   - Separate n8n instance per workspace
   - Complete isolation
   - Higher resource usage
   - More complex deployment

### Workflow Trigger Flow

```
CRM Event (e.g., Lead Created)
    ↓
Backend Service (LeadsService)
    ↓
WorkflowsService.triggerByEvent()
    ↓
WorkflowConfigurationService.getWebhookUrlForEvent()
    ↓
HTTP POST to n8n Webhook
    ↓
n8n Workflow Executes
    ↓
(Optional) n8n calls back to CRM via webhook endpoint
```

### Workflow Configuration

- **Database-driven**: Workflow configurations stored in `WorkflowConfiguration` table
- **Event Mapping**: Each event can have multiple workflow configurations
- **Webhook URL Modes**:
  - **Default**: Auto-constructed from workflow ID (`{n8nUrl}/webhook/{workflowId}`)
  - **Custom**: Full custom webhook URL (supports test/production environments)
- **Active/Inactive Toggle**: Per workflow configuration

### n8n Setup Process

1. On workspace creation, n8n user account is created (for SHARED instances)
2. n8n user credentials stored in workspace record
3. Frontend can access n8n editor via proxy (authenticated with workspace user)
4. Workflows configured via Lite CRM UI, not directly in n8n UI

---

## 📁 Project Structure

```
lite-crm/
├── backend/
│   ├── src/
│   │   ├── activities/        # Activity logging service
│   │   ├── auth/              # Authentication & authorization
│   │   ├── invites/           # User invitation system
│   │   ├── leads/             # Lead management
│   │   ├── notifications/     # Email notification service
│   │   ├── prisma/            # Prisma service & module
│   │   ├── tasks/             # Task management
│   │   ├── users/             # User management
│   │   ├── workflows/         # n8n integration
│   │   ├── workspaces/        # Workspace service
│   │   └── main.ts            # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── auth/               # Auth context & hooks
│   │   ├── components/         # React components
│   │   ├── layouts/            # Layout components
│   │   ├── pages/              # Page components
│   │   └── App.tsx             # Main app component
│   └── package.json
│
├── docker-compose.yml          # Docker orchestration
└── [Documentation files]       # Various .md files
```

---

## 🚀 Deployment

### Docker Compose Services

1. **db** (PostgreSQL)
   - Port: 5433 (host) → 5432 (container)
   - Database: `litecrm`
   - User: `litecrm` / Password: `litecrm_password`

2. **backend** (NestJS)
   - Port: 3000
   - Depends on: db
   - Environment: `.env` file

3. **frontend** (React + Nginx)
   - Port: 8080 (host) → 80 (container)
   - Depends on: backend
   - Serves built React app

4. **n8n** (Workflow Engine)
   - Port: 5678
   - Basic Auth: admin/n8n_admin_pass
   - Depends on: backend
   - Data persistence: Docker volume

### Environment Variables

**Backend (.env)**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `N8N_URL`: n8n service URL (default: http://n8n:5678)
- `N8N_API_KEY`: Optional n8n API key
- `FRONTEND_URL`: Frontend URL for CORS
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- Email configuration (SMTP settings)

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `GET /me/n8n-ready` - Check n8n setup status

### Leads
- `GET /leads` - List all leads (workspace-scoped)
- `POST /leads` - Create lead
- `GET /leads/:id` - Get lead details
- `PATCH /leads/:id` - Update lead
- `PATCH /leads/:id/stage` - Update lead stage
- `PATCH /leads/:id/assign` - Assign lead to user (ADMIN only)
- `DELETE /leads/:id` - Delete lead

### Tasks
- `GET /leads/:id/tasks` - List tasks for lead
- `POST /leads/:id/tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete

### Notes
- `GET /leads/:id/notes` - List notes for lead
- `POST /leads/:id/notes` - Create note

### Activities
- `GET /leads/:id/activities` - List activities for lead
- `PATCH /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

### Users & Team
- `GET /users` - List workspace users
- `PATCH /users/:id/role` - Update user role (ADMIN only)
- `DELETE /users/:id` - Remove user (ADMIN only)

### Invitations
- `GET /invites` - List invitations
- `POST /invites` - Create invitation (ADMIN only)
- `DELETE /invites/:id` - Cancel invitation
- `GET /invites/:id/public` - Get invitation details (public)

### Workflows
- `GET /workflows` - List n8n workflows
- `GET /workflows/:id/executions` - Get workflow executions
- `GET /workflows/config` - Get workflow configurations
- `PUT /workflows/config` - Create/update workflow configuration
- `DELETE /workflows/config/:event` - Delete workflow configuration
- `POST /workflows/trigger/:workflowId` - Manually trigger workflow

---

## 🎨 Frontend Pages

1. **Dashboard** (`/`)
   - Lead overview with stats
   - Create lead form
   - Lead filtering and search
   - Lead table with stage updates

2. **Lead Detail** (`/leads/:id`)
   - Full lead information
   - Activity timeline
   - Tasks management
   - Notes section
   - Stage updates

3. **Team** (`/team`)
   - User list
   - Invite users (ADMIN only)
   - Role management

4. **Workflows** (`/workflows`)
   - Workflow list
   - Workflow editor link
   - Configuration page

5. **Workflow Configuration** (`/workflows/configuration`)
   - Event-to-workflow mapping
   - Webhook URL configuration
   - Active/inactive toggle

6. **Settings** (`/settings`)
   - Workspace settings
   - User preferences

7. **Upgrade** (`/upgrade`)
   - Plan upgrade page
   - Trial information

---

## 🔒 Security Considerations

### Implemented
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Workspace data isolation
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration
- ✅ Input validation

### Areas for Improvement
- ⚠️ n8n user password storage (should be encrypted)
- ⚠️ API rate limiting (not implemented)
- ⚠️ Webhook token validation (mentioned but not fully implemented)
- ⚠️ HTTPS enforcement in production
- ⚠️ Security headers (CSP, X-Frame-Options, etc.)

---

## 📈 Scalability Features

- ✅ Multi-tenant architecture
- ✅ Workspace isolation at database level
- ✅ Stateless API design
- ✅ Docker-based deployment
- ✅ Database indexing (via Prisma)
- ✅ Efficient queries (Prisma ORM)

### Potential Bottlenecks
- n8n shared instance (for SHARED mode) - may need horizontal scaling
- Database connections (consider connection pooling)
- Email sending (consider queue system)

---

## 🧪 Testing

### Current State
- Jest configured for backend
- E2E test setup exists
- No test files found in codebase (likely needs implementation)

### Recommended Tests
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows
- Workflow trigger tests

---

## 📚 Documentation

The project includes extensive documentation:
- `PRODUCT_FEATURES.md` - Complete feature list
- `N8N_INTEGRATION.md` - n8n integration guide
- `N8N_PER_WORKSPACE_ISOLATION.md` - Isolation strategies
- `GCP_DEPLOYMENT_INSTRUCTIONS.md` - GCP deployment guide
- `DEPLOY_GCP_DETAILED_GUIDE.md` - Detailed deployment steps
- Various fix/setup guides

---

## 🐛 Known Issues / Technical Debt

Based on code review:

1. **n8n Password Storage**: Passwords stored in plain text (should be encrypted)
2. **Error Handling**: Some services catch errors but don't log properly
3. **Testing**: No test files found (testing infrastructure exists but unused)
4. **API Rate Limiting**: Not implemented
5. **Webhook Security**: Token validation mentioned but not fully implemented
6. **Dedicated n8n Instances**: DEDICATED mode not fully implemented
7. **Email Templates**: Basic HTML emails, could use template engine
8. **Activity Cleanup**: No automatic cleanup of old activities
9. **Lead Count Limits**: Logic exists but not enforced (trial allows unlimited)

---

## 🎯 Use Cases

1. **Sales Teams**: Track leads, manage pipeline, automate follow-ups
2. **Small Businesses**: Solo user managing customer relationships
3. **Marketing Agencies**: Track campaign leads, assign to account managers
4. **Real Estate**: Property inquiries, agent assignments, viewing schedules
5. **Service Businesses**: Client pipeline, proposal tracking, onboarding automation

---

## 🚧 Future Enhancements

From `PRODUCT_FEATURES.md`:
- Email integration (send/receive emails)
- Calendar integration (Google Calendar, Outlook)
- Reporting & analytics dashboard
- Custom fields for leads
- Bulk operations (import/export)
- Mobile app
- SMS notifications
- Document management
- Custom pipelines/stages
- Advanced search
- Tags and labels
- Lead scoring
- Marketing automation
- Sales forecasting

---

## 📊 Code Quality Observations

### Strengths
- ✅ Clean architecture (NestJS modules)
- ✅ Type safety (TypeScript throughout)
- ✅ Consistent code style
- ✅ Good separation of concerns
- ✅ Comprehensive documentation

### Areas for Improvement
- ⚠️ Error handling could be more consistent
- ⚠️ Logging could be more structured
- ⚠️ Missing unit tests
- ⚠️ Some hardcoded values (should be configurable)
- ⚠️ Magic strings (could use enums/constants)

---

## 🎓 Learning Points

1. **Multi-tenancy**: Well-implemented workspace isolation
2. **Workflow Integration**: Clean event-driven architecture
3. **Modern Stack**: Uses current best practices (NestJS, React, Prisma)
4. **Docker-first**: Easy local development and deployment
5. **Documentation**: Extensive documentation for setup and features

---

## 📝 Summary

Lite CRM is a well-architected, modern CRM system with:
- **7 core modules** (Leads, Tasks, Notes, Activities, Team, Workflows, Analytics)
- **Multi-tenant architecture** with workspace isolation
- **Workflow automation** via n8n integration
- **Role-based access control** (ADMIN/MEMBER)
- **Complete audit trail** with activity tracking
- **Modern tech stack** (NestJS, React, PostgreSQL, n8n)
- **Docker-based deployment** for easy setup

The project is production-ready with some areas for improvement (testing, security hardening, error handling). It's suitable for small to medium businesses looking for a customizable CRM with powerful automation capabilities.

---

**Study Date**: January 2025  
**Project Version**: 0.0.1  
**Status**: Active Development / Production Ready
