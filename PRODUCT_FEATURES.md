# Lite CRM - Complete Feature List & Usage Guide

## 📋 Table of Contents
1. [Core Features Overview](#core-features-overview)
2. [Detailed Feature List](#detailed-feature-list)
3. [User Guide](#user-guide)
4. [Use Cases](#use-cases)
5. [Technical Capabilities](#technical-capabilities)

---

## 🎯 Core Features Overview

Lite CRM is a modern Customer Relationship Management system with integrated workflow automation. It helps businesses manage leads, track sales pipelines, automate workflows, and collaborate with teams.

### Main Modules:
- **Lead Management** - Track and manage customer leads
- **Task Management** - Organize follow-ups and activities
- **Team Collaboration** - Multi-user workspace with roles
- **Workflow Automation** - n8n integration for custom automations
- **Activity Tracking** - Complete audit trail
- **Notes & Communication** - Document interactions

---

## 📦 Detailed Feature List

### 1. **Workspace Management**

#### Features:
- ✅ Multi-tenant workspace system
- ✅ Workspace types: SOLO or ORG
- ✅ Team size tracking
- ✅ Plan management (FREE, paid plans)
- ✅ Lead count limits per plan

#### Usage:
- Each organization gets its own isolated workspace
- Workspace settings and data are completely separate
- FREE plan allows up to 5 leads
- Paid plans have unlimited leads

---

### 2. **User Management & Authentication**

#### Features:
- ✅ Email/password authentication (LOCAL)
- ✅ Google OAuth integration (GOOGLE)
- ✅ Role-based access control (ADMIN, MEMBER)
- ✅ User invitations system
- ✅ Workspace-based user isolation
- ✅ JWT token authentication
- ✅ Secure password hashing

#### User Roles:
- **ADMIN**: Full access, can manage users, assign leads, view all data
- **MEMBER**: Limited access, can manage assigned leads and tasks

#### Usage:
- Admin users can invite team members via email
- Invitations expire after 7 days
- Users can sign up with email/password or Google account
- Each user belongs to one workspace

---

### 3. **Lead Management**

#### Features:
- ✅ Create, read, update, delete leads
- ✅ Lead staging system (NEW → CONTACTED → FOLLOW_UP → WON/LOST)
- ✅ Lead assignment to team members
- ✅ Lead filtering and search
- ✅ Lead details page with full history
- ✅ Contact information (name, email, phone, company)
- ✅ Source tracking (where lead came from)
- ✅ Region tracking (geographic segmentation)
- ✅ Owner assignment
- ✅ Lead count limits (FREE plan: 5 leads max)

#### Lead Stages:
1. **NEW** - Just created, not yet contacted
2. **CONTACTED** - Initial contact made
3. **FOLLOW_UP** - In follow-up process
4. **WON** - Deal closed successfully
5. **LOST** - Deal lost or closed without sale

#### Usage:
- Create leads from dashboard with contact information
- Filter leads by stage, source, region
- Search leads by name, email, company
- Update lead stages as they progress
- Assign leads to team members
- View detailed lead information and history
- Delete leads (with confirmation)

---

### 4. **Task Management**

#### Features:
- ✅ Create tasks associated with leads
- ✅ Task due dates
- ✅ Task completion tracking
- ✅ Task notes/descriptions
- ✅ Task ownership
- ✅ Task filtering by completion status
- ✅ Task editing

#### Usage:
- Create tasks from lead detail page
- Set due dates for follow-ups
- Mark tasks as completed
- Edit task details (title, notes, due date)
- View all tasks for a lead
- Filter tasks by completion status

---

### 5. **Activity Tracking**

#### Features:
- ✅ Automatic activity logging
- ✅ Activity types: NOTE, STAGE_CHANGE, TASK_CREATED, TASK_COMPLETED
- ✅ Activity metadata (JSON storage)
- ✅ Activity timestamps
- ✅ User attribution (who performed action)
- ✅ Complete audit trail

#### Activity Types:
- **NOTE** - User-created notes
- **STAGE_CHANGE** - Lead stage changes (auto-logged)
- **TASK_CREATED** - Task creation (auto-logged)
- **TASK_COMPLETED** - Task completion (auto-logged)

#### Usage:
- All actions are automatically logged
- View complete history on lead detail page
- Add manual notes to leads
- Track who did what and when

---

### 6. **Notes System**

#### Features:
- ✅ Create notes on leads
- ✅ Rich text notes (stored as JSON)
- ✅ Note timestamps
- ✅ User attribution
- ✅ Notes in activity feed

#### Usage:
- Add notes to document conversations
- Track important information
- Reference previous interactions
- Share context with team members

---

### 7. **Workflow Automation (n8n Integration)**

#### Features:
- ✅ n8n workflow engine integration
- ✅ Custom workflow editor interface
- ✅ Event-based workflow triggers
- ✅ Workflow configuration UI
- ✅ Support for default and custom webhook URLs
- ✅ Workflow execution history
- ✅ Multiple workflow events
- ✅ Per-workspace workflow isolation

#### Available Workflow Events:
1. **lead.created** - Triggered when a new lead is created
2. **lead.updated** - Triggered when lead details are updated
3. **lead.stage.changed** - Triggered when lead stage changes
4. **lead.assigned** - Triggered when a lead is assigned to a user
5. **task.created** - Triggered when a task is created
6. **task.completed** - Triggered when a task is marked completed
7. **user.invited** - Triggered when a user is invited

#### Workflow Configuration:
- **Default Mode**: Auto-construct webhook URL from workflow ID
- **Custom Mode**: Use custom webhook URL (supports test/production)
- Active/Inactive toggle per workflow
- Multiple workflows per event

#### Usage:
1. Create workflows in n8n editor
2. Configure event triggers in Lite CRM
3. Automatically trigger workflows on CRM events
4. Build custom automations (notifications, data sync, etc.)
5. View workflow execution history

#### n8n Instance Types:
- **SHARED** (Default): Multiple workspaces share one n8n instance
- **DEDICATED**: Each workspace gets its own n8n instance (for enterprise)

---

### 8. **Dashboard & Analytics**

#### Features:
- ✅ Lead overview dashboard
- ✅ Lead creation form
- ✅ Lead filtering (stage, source, region)
- ✅ Lead search functionality
- ✅ Quick lead stage updates
- ✅ Lead statistics (count, stage distribution)
- ✅ Real-time updates

#### Usage:
- View all leads in one place
- Quick create new leads
- Filter leads by various criteria
- Search for specific leads
- Update lead stages directly from dashboard
- Get overview of sales pipeline

---

### 9. **Email Notifications**

#### Features:
- ✅ Email notification service
- ✅ Lead assignment notifications
- ✅ User invitation emails
- ✅ Custom email templates
- ✅ HTML email support

#### Usage:
- Automatic emails when leads are assigned
- Invitation emails with accept links
- Custom notification templates

---

### 10. **Plan Management**

#### Features:
- ✅ FREE plan (up to 5 leads)
- ✅ Paid plan support
- ✅ Lead count limits per plan
- ✅ Plan upgrade prompts
- ✅ Plan-based feature access

#### Usage:
- FREE plan users see upgrade prompts after 5 leads
- Paid plans get unlimited leads
- Plan information stored per workspace

---

## 📖 User Guide

### Getting Started

#### 1. **Sign Up**
- Go to signup page
- Choose workspace type (SOLO or ORG)
- Select n8n instance type (SHARED or DEDICATED)
- Enter workspace name and team size
- Create account (email/password or Google)

#### 2. **Initial Setup**
- Workspace is automatically created
- You become the ADMIN user
- n8n integration is automatically set up (if using SHARED)
- You can start creating leads immediately

#### 3. **Inviting Team Members** (Admin Only)
- Go to Users/Team section
- Click "Invite User"
- Enter email and select role (ADMIN or MEMBER)
- User receives invitation email
- User accepts invitation and joins workspace

---

### Daily Workflow

#### Managing Leads

1. **Create a Lead**
   - Go to Dashboard
   - Fill in lead form (Name is required)
   - Add contact info (email, phone, company)
   - Set source and region
   - Click "Add Lead"
   - Lead is created in NEW stage

2. **Update Lead Stage**
   - On Dashboard, change stage dropdown
   - Or go to Lead Detail page
   - Select new stage from dropdown
   - Stage change is automatically logged

3. **Assign Lead to Team Member**
   - Go to Lead Detail page (Admin only)
   - Use assign functionality
   - Select team member
   - User receives notification email

4. **Add Notes**
   - Go to Lead Detail page
   - Scroll to Notes section
   - Click "Add Note"
   - Enter note content
   - Note is saved and visible to all team members

5. **Create Tasks**
   - Go to Lead Detail page
   - Scroll to Tasks section
   - Click "Add Task"
   - Enter title, due date, and notes
   - Task is created and assigned to you

6. **Complete Tasks**
   - Go to Lead Detail page
   - Find task in Tasks section
   - Check the checkbox to mark complete
   - Task completion is logged in activity

7. **Filter & Search Leads**
   - On Dashboard, use filter dropdowns
   - Filter by stage, source, or region
   - Use search bar to find specific leads
   - Filters can be combined

---

### Setting Up Workflows

#### Step 1: Access n8n Editor
- Go to Workflows → Workflow Editor
- Click "Open n8n Editor" button
- n8n opens in new tab

#### Step 2: Create Workflow in n8n
- Create new workflow in n8n
- Add Webhook node (HTTP Method: POST)
- Get webhook URL from n8n
- Add other nodes (email, notifications, etc.)
- Save and activate workflow in n8n

#### Step 3: Configure in Lite CRM
- Go to Workflows → Configuration
- Click "+ Add Configuration"
- Select event (e.g., "Lead Created")
- Enter workflow ID from n8n
- Choose webhook URL mode (default or custom)
- Save configuration
- Toggle to Active

#### Step 4: Test Workflow
- Create a lead in Lite CRM
- Workflow should trigger automatically
- Check n8n executions to verify

---

## 🎯 Use Cases

### Use Case 1: Sales Team Managing Leads

**Scenario**: A sales team of 5 people needs to track leads and follow up.

**How Lite CRM Helps**:
1. Admin creates workspace and invites team members
2. Leads are created from various sources (website, calls, referrals)
3. Admin assigns leads to team members
4. Team members update lead stages as they progress
5. Tasks are created for follow-ups
6. Activity is tracked for accountability
7. Pipeline is visible to all team members

**Workflows Used**:
- Lead created → Send notification email
- Lead stage changed → Update external systems
- Task created → Reminder notifications

---

### Use Case 2: Small Business Owner

**Scenario**: Solo business owner managing customer relationships.

**How Lite CRM Helps**:
1. Single-user workspace (SOLO type)
2. Track all customer inquiries as leads
3. Move leads through pipeline (NEW → CONTACTED → WON)
4. Create tasks for follow-ups
5. Add notes from conversations
6. Automate notifications to email/SMS

**Workflows Used**:
- Lead created → Send welcome email
- Lead stage changed → Update accounting system
- Task due → Send reminder

---

### Use Case 3: Marketing Agency

**Scenario**: Agency managing multiple client campaigns and leads.

**How Lite CRM Helps**:
1. Create leads from marketing campaigns
2. Track lead sources (Google Ads, Facebook, etc.)
3. Segment by region
4. Assign to account managers
5. Track conversion rates by source
6. Automate lead distribution
7. Integrate with marketing tools

**Workflows Used**:
- Lead created → Assign based on source
- Lead created → Add to email marketing list
- Lead stage changed → Update reporting dashboard
- Lead won → Trigger celebration workflow

---

### Use Case 4: Real Estate Agency

**Scenario**: Real estate agents tracking property inquiries and clients.

**How Lite CRM Helps**:
1. Create leads from property inquiries
2. Track lead sources (website, referrals, walk-ins)
3. Assign to agents by region
4. Create tasks for property viewings
5. Track communication history
6. Move leads through pipeline (inquiry → viewing → offer → closed)
7. Automate follow-up emails

**Workflows Used**:
- Lead created → Send property information
- Task created (viewing) → Add to calendar
- Lead stage changed to WON → Generate contracts
- Lead assigned → Notify agent

---

### Use Case 5: Service Business

**Scenario**: Service business (consulting, freelancing) managing client pipeline.

**How Lite CRM Helps**:
1. Track potential clients as leads
2. Create tasks for proposal deadlines
3. Document conversations in notes
4. Track proposal status (NEW → PROPOSAL → NEGOTIATION → WON)
5. Automate client onboarding after win
6. Integrate with invoicing systems

**Workflows Used**:
- Lead created → Send information packet
- Lead stage changed to WON → Create invoice
- Task created (proposal due) → Send reminder
- Lead won → Trigger onboarding workflow

---

## 🔧 Technical Capabilities

### API Endpoints

#### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `GET /me/n8n-ready` - Check n8n setup status

#### Leads
- `GET /leads` - List all leads
- `POST /leads` - Create lead
- `GET /leads/:id` - Get lead details
- `PATCH /leads/:id` - Update lead
- `PATCH /leads/:id/stage` - Update lead stage
- `PATCH /leads/:id/assign` - Assign lead to user
- `DELETE /leads/:id` - Delete lead

#### Tasks
- `GET /leads/:id/tasks` - List tasks for lead
- `POST /leads/:id/tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete

#### Notes
- `GET /leads/:id/notes` - List notes for lead
- `POST /leads/:id/notes` - Create note

#### Activities
- `GET /leads/:id/activities` - List activities for lead
- `PATCH /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

#### Users & Team
- `GET /users` - List workspace users
- `PATCH /users/:id/role` - Update user role
- `DELETE /users/:id` - Remove user

#### Invitations
- `GET /invites` - List invitations
- `POST /invites` - Create invitation
- `DELETE /invites/:id` - Cancel invitation
- `GET /invites/:id/public` - Get invitation details

#### Workflows
- `GET /workflows` - List n8n workflows
- `GET /workflows/:id/executions` - Get workflow executions
- `GET /workflows/config` - Get workflow configurations
- `PUT /workflows/config` - Create/update workflow configuration
- `DELETE /workflows/config/:event` - Delete workflow configuration
- `POST /workflows/trigger/:workflowId` - Manually trigger workflow

---

### Database Models

#### Core Models:
- **Workspace** - Organization/tenant
- **User** - System users
- **Lead** - Customer leads
- **Task** - Follow-up tasks
- **Activity** - Activity log entries
- **Invite** - User invitations
- **WorkflowConfiguration** - Workflow event mappings

#### Relationships:
- Workspace → Users (one-to-many)
- Workspace → Leads (one-to-many)
- User → Leads (one-to-many, as owner)
- Lead → Tasks (one-to-many)
- Lead → Activities (one-to-many)
- User → Tasks (one-to-many)

---

### Technology Stack

#### Frontend:
- React (with TypeScript)
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Nginx (web server)

#### Backend:
- NestJS (Node.js framework)
- TypeScript
- Prisma ORM
- PostgreSQL (database)
- JWT (authentication)
- Docker (containerization)

#### Workflow Automation:
- n8n (workflow engine)
- Custom webhook integrations
- Event-driven architecture

#### Infrastructure:
- Docker Compose (orchestration)
- PostgreSQL (database)
- Nginx (reverse proxy)
- Volume-based data persistence

---

### Security Features

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Workspace data isolation
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure cookie handling

---

### Scalability Features

- ✅ Multi-tenant architecture
- ✅ Workspace isolation
- ✅ Plan-based feature limits
- ✅ Docker-based deployment
- ✅ Stateless API design
- ✅ Database indexing
- ✅ Efficient queries (Prisma)

---

## 📊 Feature Comparison Matrix

| Feature | Lite CRM | Zoho CRM | HubSpot | Pipedrive |
|---------|----------|----------|---------|-----------|
| Lead Management | ✅ | ✅ | ✅ | ✅ |
| Task Management | ✅ | ✅ | ✅ | ✅ |
| Team Collaboration | ✅ | ✅ | ✅ | ✅ |
| Workflow Automation | ✅ (n8n) | ✅ (Zapier) | ✅ (native) | ✅ (native) |
| Custom Workflows | ✅ | Limited | ✅ | Limited |
| Notes & Activity | ✅ | ✅ | ✅ | ✅ |
| Free Plan | ✅ (5 leads) | ✅ | ✅ | ❌ |
| API Access | ✅ | ✅ | ✅ | ✅ |
| Open Source | ✅ | ❌ | ❌ | ❌ |
| Self-Hosted Option | ✅ | ❌ | ❌ | ❌ |

---

## 🎓 Training & Support

### For End Users:
- Intuitive dashboard interface
- Contextual help text
- Workflow setup guide
- Step-by-step configuration

### For Administrators:
- User management
- Workspace settings
- Workflow configuration
- Plan management

---

## 🚀 Future Enhancement Ideas

### Potential Additions:
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

## 📝 Summary

Lite CRM is a comprehensive CRM solution with:
- **7 core modules** (Leads, Tasks, Notes, Activities, Team, Workflows, Analytics)
- **10+ workflow events** for automation
- **Multi-user collaboration** with role-based access
- **Custom workflow automation** via n8n
- **Complete audit trail** with activity tracking
- **Scalable architecture** for growth
- **Modern tech stack** for reliability

Perfect for businesses of all sizes looking for an affordable, customizable CRM with powerful automation capabilities.
