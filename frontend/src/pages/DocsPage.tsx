import AppLayout from "@/layouts/AppLayout";
import { Link } from "react-router-dom";

export default function DocsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Documentation</h1>
          <p className="text-lg text-slate-600">
            Complete guide to using Lite CRM effectively
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-slate-700">
            <li><a href="#overview" className="text-blue-600 hover:underline">1. Overview</a></li>
            <li><a href="#getting-started" className="text-blue-600 hover:underline">2. Getting Started</a></li>
            <li><a href="#lead-management" className="text-blue-600 hover:underline">3. Lead Management</a></li>
            <li><a href="#tasks-notes" className="text-blue-600 hover:underline">4. Tasks & Notes</a></li>
            <li><a href="#team-collaboration" className="text-blue-600 hover:underline">5. Team Collaboration</a></li>
            <li><a href="#workflow-automation" className="text-blue-600 hover:underline">6. Workflow Automation</a></li>
            <li><a href="#api-integration" className="text-blue-600 hover:underline">7. API Integration</a></li>
          </ul>
        </div>

        {/* Overview Section */}
        <section id="overview" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">1. Overview</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Lite CRM is a modern, lightweight Customer Relationship Management system designed for small to medium-sized businesses. 
              It combines essential CRM features with powerful workflow automation capabilities through n8n integration.
            </p>
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Key Features</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>Lead Management:</strong> Track and manage your sales leads through the entire pipeline</li>
              <li><strong>Task & Follow-ups:</strong> Never miss a follow-up with built-in task management</li>
              <li><strong>Team Collaboration:</strong> Invite team members and assign leads</li>
              <li><strong>Workflow Automation:</strong> Automate repetitive tasks with n8n integration</li>
              <li><strong>Activity Timeline:</strong> Complete audit trail of all lead interactions</li>
              <li><strong>Notes System:</strong> Keep detailed notes on every lead</li>
            </ul>
          </div>
        </section>

        {/* Getting Started Section */}
        <section id="getting-started" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">2. Getting Started</h2>
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Creating Your Account</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Navigate to the signup page</li>
              <li>Enter your name, email, and password</li>
              <li>Choose between Individual or Organization account type</li>
              <li>Complete the signup process</li>
              <li>You'll be redirected to the Dashboard</li>
            </ol>
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Understanding the Dashboard</h3>
            <p className="text-slate-700 mb-3">
              The Dashboard is your central hub where you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>View all your leads in one place</li>
              <li>See statistics (Total Leads, New, Contacted, Won, Lost)</li>
              <li>Create new leads quickly</li>
              <li>Filter and search leads</li>
              <li>Update lead stages</li>
            </ul>
          </div>
        </section>

        {/* Lead Management Section */}
        <section id="lead-management" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">3. Lead Management</h2>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Adding a New Lead</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Go to the Dashboard</li>
              <li>Fill in the "Add New Lead" form at the top</li>
              <li>Enter the lead's name (required)</li>
              <li>Optionally add email, phone, company, source, and region</li>
              <li>Click "Add Lead" button</li>
              <li>The lead will appear in your leads table immediately</li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Email and phone are optional, but at least one contact method is recommended for follow-ups.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Viewing Lead Details</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Click on any lead's name in the Dashboard table</li>
              <li>The Lead Detail page shows:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Complete lead information</li>
                  <li>All tasks associated with the lead</li>
                  <li>Notes and activity timeline</li>
                  <li>Lead assignment options (Admin only)</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Updating Lead Stage</h3>
            <p className="text-slate-700 mb-3">
              Track your leads through the sales pipeline by updating their stage:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li><strong>NEW:</strong> Just added to the system</li>
              <li><strong>CONTACTED:</strong> Initial contact has been made</li>
              <li><strong>WON:</strong> Deal closed successfully</li>
              <li><strong>LOST:</strong> Opportunity did not convert</li>
            </ol>
            <p className="text-slate-700 mt-4">
              To update a lead's stage, use the dropdown in the "Stage" column on the Dashboard, 
              or change it from the Lead Detail page.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Deleting a Lead</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>On the Dashboard, find the lead you want to delete</li>
              <li>Click the "Delete" button in the "Actions" column</li>
              <li>Confirm the deletion in the popup dialog</li>
              <li>The lead will be permanently removed from your CRM</li>
            </ol>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting a lead is permanent and cannot be undone. All associated tasks, notes, and activities will also be deleted.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Filtering and Searching Leads</h3>
            <p className="text-slate-700 mb-3">
              Use the filter section on the Dashboard to find specific leads:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>Search:</strong> Type in the search box to find leads by name, email, or company</li>
              <li><strong>Stage Filter:</strong> Filter by stage (NEW, CONTACTED, WON, LOST, or ALL)</li>
              <li><strong>Source Filter:</strong> Filter by lead source (Website, Ads, Referral, Manual, Import, or ALL)</li>
              <li><strong>Region Filter:</strong> Type to filter by region</li>
            </ul>
          </div>
        </section>

        {/* Tasks & Notes Section */}
        <section id="tasks-notes" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">4. Tasks & Notes</h2>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Creating a Task</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Navigate to a lead's detail page</li>
              <li>Scroll to the "Tasks" section</li>
              <li>Click "Add Task" button</li>
              <li>Fill in:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Task title (required)</li>
                  <li>Due date (required)</li>
                  <li>Notes (optional)</li>
                </ul>
              </li>
              <li>Click "Create Task"</li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Managing Tasks</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>Mark Complete:</strong> Click the checkbox next to a task to mark it as completed</li>
              <li><strong>Edit Task:</strong> Click "Edit" to modify the title, due date, or notes</li>
              <li><strong>Delete Task:</strong> Click "Delete" to remove a task</li>
              <li><strong>Filter Tasks:</strong> Use the filter buttons (All, Today, Overdue) to view specific tasks</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Adding Notes</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Go to a lead's detail page</li>
              <li>Scroll to the "Notes" section</li>
              <li>Click "Add Note" button</li>
              <li>Enter your note in the text area</li>
              <li>Click "Save Note"</li>
              <li>The note will appear in the notes list and activity timeline</li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Editing and Deleting Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>Edit Note:</strong> Click "Edit" next to a note to modify it</li>
              <li><strong>Delete Note:</strong> Click "Delete" to remove a note permanently</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Activity Timeline</h3>
            <p className="text-slate-700 mb-3">
              The Activity Timeline provides a complete history of all interactions with a lead:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Lead creation and updates</li>
              <li>Stage changes</li>
              <li>Task creation and completion</li>
              <li>Notes added</li>
              <li>Lead assignments</li>
            </ul>
            <p className="text-slate-700 mt-4">
              View the timeline on any lead's detail page to see the complete audit trail.
            </p>
          </div>
        </section>

        {/* Team Collaboration Section */}
        <section id="team-collaboration" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">5. Team Collaboration</h2>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Inviting Team Members (Admin Only)</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Navigate to the "Team" page from the main menu</li>
              <li>Click "Invite User" button</li>
              <li>Enter the email address of the person you want to invite</li>
              <li>Select their role:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>ADMIN:</strong> Full access to workspace settings, user management, and all features</li>
                  <li><strong>MEMBER:</strong> Can manage leads, tasks, and notes but cannot invite users or change workspace settings</li>
                </ul>
              </li>
              <li>Click "Send Invite"</li>
              <li>The invited user will receive an email with an acceptance link</li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Invites expire after 7 days. You can revoke an invite at any time from the Team page.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Accepting an Invitation</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Click the invitation link in the email you received</li>
              <li>Complete the signup form with your name and password</li>
              <li>You'll be automatically added to the workspace</li>
              <li>You can now access the workspace with your assigned role</li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Assigning Leads to Team Members</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Go to a lead's detail page</li>
              <li>Find the "Owner" section (Admin only)</li>
              <li>Select a team member from the dropdown</li>
              <li>The lead will be assigned to that user</li>
              <li>The assignment will appear in the activity timeline</li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Managing Team Members</h3>
            <p className="text-slate-700 mb-3">
              Admins can manage team members from the Team page:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>View All Members:</strong> See all users in your workspace</li>
              <li><strong>Change Roles:</strong> Update a member's role (ADMIN or MEMBER)</li>
              <li><strong>Remove Members:</strong> Remove users from the workspace (cannot remove yourself)</li>
              <li><strong>View Pending Invites:</strong> See all outstanding invitations</li>
              <li><strong>Revoke Invites:</strong> Cancel pending invitations</li>
            </ul>
          </div>
        </section>

        {/* Workflow Automation Section */}
        <section id="workflow-automation" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">6. Workflow Automation</h2>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Introduction to Workflows</h3>
            <p className="text-slate-700 mb-3">
              Lite CRM integrates with n8n, an open-source workflow automation tool, to help you automate repetitive tasks 
              and integrate with other services.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Setting Up Your First Workflow</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Navigate to "Workflows" → "Setup Guide" for detailed instructions</li>
              <li>Click "Open n8n Editor" to access the n8n interface</li>
              <li>Create a new workflow in n8n</li>
              <li>Add a "Webhook" node as the trigger (HTTP Method: POST)</li>
              <li>Copy the Webhook URL from n8n</li>
              <li>Copy the Workflow ID from the n8n editor URL</li>
              <li>Go to "Workflows" → "Configure" in Lite CRM</li>
              <li>Add a new configuration:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Select the event (e.g., "Lead Created")</li>
                  <li>Paste the Workflow ID</li>
                  <li>Choose to use default webhook URL or provide a custom one</li>
                </ul>
              </li>
              <li>Activate the workflow in n8n (toggle switch in top-right)</li>
            </ol>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Available Workflow Events</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>lead.created:</strong> Triggered when a new lead is added</li>
              <li><strong>lead.updated:</strong> Triggered when lead details are modified</li>
              <li><strong>lead.stage.changed:</strong> Triggered when a lead's stage changes</li>
              <li><strong>lead.assigned:</strong> Triggered when a lead is assigned to a user</li>
              <li><strong>task.created:</strong> Triggered when a new task is created</li>
              <li><strong>task.completed:</strong> Triggered when a task is marked as complete</li>
              <li><strong>user.invited:</strong> Triggered when a new user is invited</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Viewing Workflow Executions</h3>
            <p className="text-slate-700 mb-3">
              Monitor your workflow executions from the Workflows page:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
              <li>Go to "Workflows" page</li>
              <li>Click on a workflow to view its execution history</li>
              <li>See recent executions, their status, and execution data</li>
            </ol>
          </div>
        </section>

        {/* API Integration Section */}
        <section id="api-integration" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">7. API Integration</h2>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Authentication</h3>
            <p className="text-slate-700 mb-3">
              All API requests require authentication using a JWT token. Include the token in the Authorization header:
            </p>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
              <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Base URL</h3>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
              <code>http://localhost:3000/api</code>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Key Endpoints</h3>
            
            <div className="space-y-6 mt-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Leads</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-mono">
                  <li><code className="bg-slate-100 px-2 py-1 rounded">GET /leads</code> - List all leads</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">POST /leads</code> - Create a new lead</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">GET /leads/:id</code> - Get lead details</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">PATCH /leads/:id</code> - Update lead</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">DELETE /leads/:id</code> - Delete lead</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">PATCH /leads/:id/stage</code> - Update lead stage</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Tasks</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-mono">
                  <li><code className="bg-slate-100 px-2 py-1 rounded">GET /tasks/lead/:leadId</code> - Get tasks for a lead</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">POST /tasks</code> - Create a task</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">PATCH /tasks/:id</code> - Update a task</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">DELETE /tasks/:id</code> - Delete a task</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">POST /tasks/:id/complete</code> - Mark task as complete</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Workflows</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-mono">
                  <li><code className="bg-slate-100 px-2 py-1 rounded">GET /workflows</code> - List all workflows</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">GET /workflows/config</code> - Get workflow configurations</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">PUT /workflows/config</code> - Create/update workflow configuration</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Example: Creating a Lead</h3>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
              <pre>{`POST /api/leads
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "source": "Website",
  "region": "North America"
}`}</pre>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Example: Creating a Task</h3>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
              <pre>{`POST /api/tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "leadId": "lead-id-here",
  "title": "Follow up call",
  "dueAt": "2026-01-15T10:00:00Z",
  "note": "Call to discuss pricing"
}`}</pre>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need More Help?</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/workflows/setup-guide"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Workflow Setup Guide
            </Link>
            <Link
              to="/upgrade"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
