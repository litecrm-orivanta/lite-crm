# Lite CRM - Project Study & Architecture Overview

## 📋 Executive Summary

**Lite CRM** is a full-stack Customer Relationship Management (CRM) application built with modern web technologies. It provides lead management, task tracking, team collaboration, and workflow automation capabilities through integration with n8n.

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend:**
- **Framework**: NestJS (Node.js, TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport (Local & Google OAuth)
- **Automation**: n8n workflow integration
- **Email**: Nodemailer
- **Scheduling**: @nestjs/schedule (for cron jobs)

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API

**Infrastructure:**
- **Containerization**: Docker & Docker Compose
- **Services**: Backend, Frontend, PostgreSQL, n8n
- **Ports**: 
  - Backend: 3000
  - Frontend: 8080
  - Database: 5433
  - n8n: 5678

---

## 📊 Database Schema

### Core Models

1. **Workspace**
   - Multi-tenant architecture
   - Types: SOLO, ORG
   - Plans: FREE (5 leads limit)
   - n8n integration tracking

2. **User**
   - Email-based authentication
   - Roles: ADMIN, MEMBER
   - Auth providers: LOCAL, GOOGLE
   - Belongs to one workspace

3. **Lead**
   - Core CRM entity
   - Fields: name, email, phone, company, source, region
   - Stages: NEW → CONTACTED → FOLLOW_UP → WON/LOST
   - Owner assignment (many-to-one with User)

4. **Task**
   - Linked to leads
   - Fields: title, note, dueAt, completed
   - Owner tracking

5. **Activity**
   - Audit trail for leads
   - Types: NOTE, STAGE_CHANGE, TASK_CREATED, TASK_COMPLETED
   - JSON metadata for flexibility

6. **Invite**
   - Team member invitations
   - Email-based, expires after 7 days
   - Role assignment

---

## 🔐 Authentication & Authorization

### Authentication Methods

1. **Local Authentication**
   - Email + password
   - Bcrypt password hashing
   - JWT token generation

2. **Google OAuth**
   - Passport Google OAuth20 strategy
   - Auto-creates workspace for new users
   - Provider ID tracking

### Authorization

- **JWT Strategy**: Token contains user ID, email, role, workspaceId
- **Role-Based Access Control**:
  - ADMIN: Full access, can invite users, assign leads
  - MEMBER: Limited access, cannot invite or assign
- **Workspace Isolation**: All operations scoped to user's workspace
- **Guards**: JWT auth guard protects all routes

---

## 🎯 Core Features & Modules

### 1. Leads Management (`/leads`)

**Functionality:**
- Create, read, update, delete leads
- Stage management (pipeline)
- Lead assignment to team members
- Activity tracking
- Free plan limit: 5 leads

**API Endpoints:**
- `GET /leads` - List all leads
- `GET /leads/:id` - Get lead details
- `POST /leads` - Create lead
- `PATCH /leads/:id` - Update lead
- `PATCH /leads/:id/stage` - Change stage
- `POST /leads/:id/assign` - Assign to user (admin only)

**Workflow Triggers:**
- `lead.created`
- `lead.updated`
- `lead.stage.changed`
- `lead.assigned`

### 2. Tasks Management (`/tasks`)

**Functionality:**
- Create tasks linked to leads
- Mark tasks as complete
- Edit task details (title, note, due date)
- Delete tasks

**API Endpoints:**
- `GET /leads/:leadId/tasks` - List tasks for a lead
- `POST /leads/:leadId/tasks` - Create task
- `PATCH /leads/:leadId/tasks/:taskId` - Update task
- `POST /leads/:leadId/tasks/:taskId/complete` - Mark complete
- `DELETE /leads/:leadId/tasks/:taskId` - Delete task

**Workflow Triggers:**
- `task.created`
- `task.completed`

### 3. Activities & Notes (`/activities`)

**Functionality:**
- Automatic activity logging
- Manual notes on leads
- Activity timeline view

**Activity Types:**
- NOTE: User-created notes
- STAGE_CHANGE: Pipeline stage transitions
- TASK_CREATED: Task creation events
- TASK_COMPLETED: Task completion events

### 4. Team Management (`/team`, `/invites`)

**Functionality:**
- List workspace members
- Invite users via email
- Role management (ADMIN/MEMBER)
- Accept invitations
- Revoke invitations

**API Endpoints:**
- `GET /users` - List workspace users
- `PATCH /users/:id/role` - Change user role (admin only)
- `GET /invites` - List active invites
- `POST /invites` - Create invite
- `DELETE /invites/:id` - Revoke invite
- `GET /invites/:id` - Get invite details (public)

**Workflow Triggers:**
- `user.invited`

### 5. Workflows & Automation (`/workflows`)

**Functionality:**
- n8n workflow integration
- Event-driven automation
- Embedded workflow editor
- Workflow execution tracking

**Architecture:**
- Backend proxies n8n API requests
- JWT-based authentication proxy
- Webhook triggers on CRM events
- Embedded iframe editor in frontend

**Events That Trigger Workflows:**
- Lead lifecycle events
- Task events
- User invitation events

**API Endpoints:**
- `GET /workflows` - List workflows
- `GET /workflows/:id/executions` - Get execution history
- `POST /workflows/trigger/:id` - Manual trigger

### 6. Email Notifications (`/notifications`)

**Functionality:**
- Email sending via Nodemailer
- Invitation emails
- Lead assignment notifications
- Configurable SMTP settings

---

## 🔄 Workflow Integration (n8n)

### How It Works

1. **Event Triggers**: CRM events trigger workflow calls
2. **Webhook Execution**: n8n workflows receive data via webhooks
3. **Automation**: Workflows can perform actions based on CRM events
4. **Proxy Authentication**: Backend proxies n8n API calls with authentication

### Configuration

- **n8n URL**: `http://n8n:5678` (docker network) or `http://localhost:5678`
- **Basic Auth**: admin/n8n_admin_pass (configurable)
- **Environment Variables**: Workflow IDs stored in backend `.env`

### Embedded Editor

- Full n8n workflow editor embedded in CRM UI
- Single sign-on experience
- Authentication proxy handles auth
- Seamless user experience

---

## 📁 Project Structure

```
lite-crm/
├── backend/
│   ├── src/
│   │   ├── activities/        # Activity logging service
│   │   ├── auth/              # Authentication & authorization
│   │   ├── leads/             # Lead management
│   │   ├── tasks/             # Task management
│   │   ├── invites/           # Team invitations
│   │   ├── users/             # User management
│   │   ├── workflows/         # n8n integration
│   │   ├── notifications/     # Email service
│   │   ├── prisma/            # Database client
│   │   └── common/            # Shared utilities
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── auth/              # Auth context & hooks
│   │   ├── components/        # Reusable components
│   │   ├── layouts/           # Layout components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities
│   │   └── App.tsx            # Main app router
│   └── package.json
│
└── docker-compose.yml         # Multi-container setup
```

---

## 🔌 API Architecture

### Request Flow

1. **Frontend** → `apiFetch()` or `http()` helper
2. **Authorization Header**: `Bearer <JWT_TOKEN>`
3. **Backend** → JWT Guard validates token
4. **Service Layer** → Business logic + database operations
5. **Response** → JSON data back to frontend

### API Base URLs

- **Development**: `http://localhost:3000` (backend)
- **Production**: Configurable via `VITE_API_URL` env var

### Error Handling

- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show upgrade message (if free plan limit)
- Standard error responses with message field

---

## 🎨 Frontend Architecture

### Routing

- `/login` - Login page
- `/signup` - Signup page
- `/` - Dashboard (protected)
- `/leads/:id` - Lead details (protected)
- `/team` - Team management (protected)
- `/workflows` - Workflows page (protected)
- `/workflows/editor` - Embedded n8n editor (protected)
- `/upgrade` - Upgrade page (protected)
- `/accept-invite/:inviteId` - Accept invitation (public)

### State Management

- **Auth Context**: Global auth state (token, user, role)
- **Local Storage**: Token persistence
- **Component State**: React hooks for local state
- **No external state library** (Redux, Zustand, etc.)

### UI Components

- **shadcn/ui**: Base component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icons
- **Custom Components**: LeadCard, Header, Sidebar, etc.

---

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: Bcrypt with salt rounds
3. **Workspace Isolation**: Data scoped to workspace
4. **Role-Based Access**: ADMIN vs MEMBER permissions
5. **CORS Configuration**: Restricted origins
6. **Input Validation**: DTOs with class-validator
7. **SQL Injection Protection**: Prisma ORM parameterized queries

---

## 📈 Business Logic

### Free Plan Limitations

- Maximum 5 leads per workspace
- Upgrade required for more leads

### Workspace Types

- **SOLO**: Individual user workspace
- **ORG**: Organization workspace (team collaboration)

### Lead Stages Pipeline

```
NEW → CONTACTED → FOLLOW_UP → [WON | LOST]
```

### Task Management

- Tasks linked to leads
- Due date tracking
- Completion status
- Owner assignment

---

## 🚀 Development Setup

### Prerequisites

- Node.js
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Environment Variables

**Backend (`.env`):**
```env
DATABASE_URL=postgresql://litecrm:litecrm_pass@db:5432/litecrm
JWT_SECRET=your-jwt-secret
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass
# SMTP settings for email
```

**Frontend:**
```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

1. **Docker Compose** (recommended):
   ```bash
   docker-compose up -d
   ```

2. **Development Mode**:
   ```bash
   # Backend
   cd backend
   npm install
   npm run prisma:migrate
   npm run start:dev
   
   # Frontend
   cd frontend
   npm install
   npm run dev
   ```

---

## 📝 Key Design Decisions

1. **Multi-tenant Architecture**: Workspace-based isolation
2. **Event-Driven Workflows**: n8n integration for extensibility
3. **Embedded n8n Editor**: Unified user experience
4. **Free Tier Strategy**: 5 leads limit to encourage upgrades
5. **Activity Logging**: Comprehensive audit trail
6. **Email Notifications**: Automated team communication
7. **Role-Based Permissions**: Flexible team management

---

## 🔮 Potential Enhancements

1. **Pagination**: For large lead lists
2. **Search & Filters**: Advanced lead filtering
3. **Export Functionality**: CSV/Excel export
4. **Reporting & Analytics**: Dashboard metrics
5. **Email Templates**: Customizable email templates
6. **Webhooks API**: Allow external integrations
7. **Mobile App**: React Native or mobile web
8. **Real-time Updates**: WebSocket support
9. **File Attachments**: For leads and tasks
10. **Calendar Integration**: Sync tasks with calendars

---

## 📚 Documentation Files

The project includes extensive documentation:
- `QUICK_START_N8N.md` - n8n integration guide
- `N8N_INTEGRATION.md` - Detailed workflow setup
- `EMBEDDED_N8N_SETUP.md` - Embedded editor setup
- `INTEGRATION_DIAGRAM.md` - Architecture diagrams
- Various fix documentation files for troubleshooting

---

## 🎯 Summary

Lite CRM is a well-architected, modern CRM application with:
- ✅ Clean separation of concerns
- ✅ Type-safe codebase (TypeScript)
- ✅ Scalable architecture (multi-tenant)
- ✅ Extensible automation (n8n)
- ✅ Modern UI/UX (React + Tailwind)
- ✅ Comprehensive feature set
- ✅ Docker-based deployment

The codebase demonstrates good software engineering practices with proper authentication, authorization, database modeling, and API design.
