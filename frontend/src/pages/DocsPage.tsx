import AppLayout from "@/layouts/AppLayout";
import { Link } from "react-router-dom";
import LiteCRMLogo from "@/components/LiteCRMLogo";

export default function DocsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Premium Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <LiteCRMLogo size="lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Documentation
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Complete guide to using Lite CRM effectively - Your all-in-one CRM solution
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-16 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="#overview" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">1.</span> Overview
              </a>
              <a href="#getting-started" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">2.</span> Getting Started
              </a>
              <a href="#lead-management" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">3.</span> Lead Management
              </a>
              <a href="#pipeline-kanban" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">4.</span> Pipeline & Kanban
              </a>
              <a href="#calendar-tasks" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">5.</span> Calendar & Tasks
              </a>
              <a href="#reports-analytics" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">6.</span> Reports & Analytics
              </a>
              <a href="#workflow-automation" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">7.</span> Workflow Automation
              </a>
              <a href="#team-collaboration" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">8.</span> Team Collaboration
              </a>
              <a href="#integrations" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">9.</span> Integrations
              </a>
              <a href="#api-reference" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">10.</span> API Reference
              </a>
            </div>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">1. Overview</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                  Lite CRM is a modern, powerful Customer Relationship Management system designed for businesses of all sizes. 
                  It combines essential CRM features with native workflow automation, multi-channel messaging, and advanced analytics 
                  - all without external dependencies.
                </p>
                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Unlimited Lead Management</h4>
                      <p className="text-sm text-slate-600">Track and manage unlimited leads through your entire sales pipeline</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Native Workflow Automation</h4>
                      <p className="text-sm text-slate-600">Built-in workflow engine - no external dependencies required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Multi-Channel Messaging</h4>
                      <p className="text-sm text-slate-600">WhatsApp, Telegram, SMS, Email - all integrated natively</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
                      <p className="text-sm text-slate-600">Comprehensive reports and insights into your sales performance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Team Collaboration</h4>
                      <p className="text-sm text-slate-600">Invite team members, assign leads, and collaborate seamlessly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Custom Workflows</h4>
                      <p className="text-sm text-slate-600">Create unlimited custom workflows with visual editor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section id="getting-started" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">2. Getting Started</h2>
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Creating Your Account</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to the signup page</li>
                  <li>Enter your name, email, and password</li>
                  <li>Choose between Individual or Organization account type</li>
                  <li>Complete the signup process</li>
                  <li>You'll be redirected to the Dashboard</li>
                </ol>
                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Understanding the Dashboard</h3>
                <p className="text-slate-700 mb-4">
                  The Dashboard is your central hub where you can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>View all your leads in one place with advanced filtering</li>
                  <li>See real-time statistics (Total Leads, New, Contacted, Won, Lost)</li>
                  <li>Create new leads quickly with the inline form</li>
                  <li>Export leads to CSV</li>
                  <li>Perform bulk operations (update, delete, assign)</li>
                  <li>Use saved filter presets for quick access</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Lead Management Section */}
          <section id="lead-management" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">3. Lead Management</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Adding a New Lead</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to the Dashboard</li>
                  <li>Fill in the "Add New Lead" form at the top</li>
                  <li>Enter the lead's name (required)</li>
                  <li>Optionally add email, phone, company, source, and region</li>
                  <li>Click "Add Lead" button</li>
                  <li>The lead will appear in your leads table immediately</li>
                </ol>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded-r-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Email and phone are optional, but at least one contact method is recommended for follow-ups.
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Bulk Operations</h3>
                <p className="text-slate-700 mb-4">
                  Select multiple leads and perform bulk actions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Bulk Update:</strong> Change stage, source, region, or assign owner for multiple leads</li>
                  <li><strong>Bulk Delete:</strong> Remove multiple leads at once</li>
                  <li><strong>Bulk Assign:</strong> Assign multiple leads to a team member</li>
                  <li><strong>Export to CSV:</strong> Export filtered leads to CSV file</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Saved Filters</h3>
                <p className="text-slate-700 mb-4">
                  Save frequently used filter combinations for quick access:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Apply your desired filters (stage, source, region, search)</li>
                  <li>Click "Save Filter" button</li>
                  <li>Give it a name (e.g., "Hot Leads", "Q4 Prospects")</li>
                  <li>Access saved filters from the dropdown menu</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Custom Fields</h3>
                <p className="text-slate-700 mb-4">
                  Add custom fields to capture additional lead information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Go to Settings → Custom Fields</li>
                  <li>Create fields of different types: text, number, date, select, boolean</li>
                  <li>Custom fields appear on lead detail pages</li>
                  <li>Use custom fields in workflows and reports</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pipeline & Kanban Section */}
          <section id="pipeline-kanban" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">4. Pipeline & Kanban Board</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Kanban Board View</h3>
                <p className="text-slate-700 mb-4">
                  Visualize your sales pipeline with the Kanban board:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Access from the "Pipeline" link in the navigation</li>
                  <li>See all leads organized by stage (NEW, CONTACTED, WON, LOST)</li>
                  <li>Drag and drop leads between stages</li>
                  <li>View lead details by clicking on any card</li>
                  <li>See assigned owner on each card</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Managing Pipeline Stages</h3>
                <p className="text-slate-700 mb-4">
                  Update lead stages directly from the Kanban board:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Drag a lead card to a different stage column</li>
                  <li>The lead's stage will update automatically</li>
                  <li>Workflows can trigger on stage changes</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Calendar & Tasks Section */}
          <section id="calendar-tasks" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">5. Calendar & Tasks</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Calendar View</h3>
                <p className="text-slate-700 mb-4">
                  View all tasks on a calendar:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Access from the "Calendar" link in the navigation</li>
                  <li>See all tasks organized by due date</li>
                  <li>Filter by date range</li>
                  <li>Click on tasks to view details</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Creating a Task</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to a lead's detail page</li>
                  <li>Scroll to the "Tasks" section</li>
                  <li>Click "Add Task" button</li>
                  <li>Fill in task title, due date, and optional notes</li>
                  <li>Click "Create Task"</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">File Attachments</h3>
                <p className="text-slate-700 mb-4">
                  Attach files to leads:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to a lead's detail page</li>
                  <li>Scroll to the "Attachments" section</li>
                  <li>Click "Upload File"</li>
                  <li>Select a file from your device</li>
                  <li>Files are stored securely and accessible anytime</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Reports & Analytics Section */}
          <section id="reports-analytics" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">6. Reports & Analytics</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Analytics Dashboard</h3>
                <p className="text-slate-700 mb-4">
                  Access comprehensive analytics from the "Reports" page:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Lead Statistics:</strong> Total leads, leads by stage, conversion rates</li>
                  <li><strong>Source Analysis:</strong> See which sources generate the most leads</li>
                  <li><strong>Regional Insights:</strong> Geographic distribution of leads</li>
                  <li><strong>Team Performance:</strong> Track individual and team metrics</li>
                  <li><strong>Time-based Trends:</strong> Monthly and yearly trends</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Exporting Reports</h3>
                <p className="text-slate-700 mb-4">
                  Export lead data for external analysis:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Apply filters on the Dashboard</li>
                  <li>Click "Export to CSV" button</li>
                  <li>CSV file will download with all filtered leads</li>
                  <li>Open in Excel, Google Sheets, or any spreadsheet tool</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Workflow Automation Section */}
          <section id="workflow-automation" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">7. Workflow Automation</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Introduction to Workflows</h3>
                <p className="text-slate-700 mb-4">
                  Lite CRM includes a powerful built-in workflow automation system that allows you to automate repetitive tasks 
                  and integrate with various services without any external dependencies.
                </p>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Creating Your First Workflow</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to "Workflows" from the main menu</li>
                  <li>Click "Create Workflow" or "Edit" on an existing workflow</li>
                  <li>You'll see the visual workflow editor with a node palette</li>
                  <li>Add a "Trigger" node and select an event (e.g., "Lead Created")</li>
                  <li>Add action nodes from the palette:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Communication:</strong> Email, WhatsApp, Telegram, Slack, SMS</li>
                      <li><strong>AI & Integration:</strong> ChatGPT, HTTP Request, Webhook</li>
                      <li><strong>Logic & Control:</strong> Condition, Delay, Loop</li>
                      <li><strong>Data:</strong> Set Variable, Transform, Filter, Merge, Split, Log</li>
                    </ul>
                  </li>
                  <li>Connect nodes by dragging from the blue handle (bottom) to green handle (top)</li>
                  <li>Configure each node by clicking on it and filling in the required fields</li>
                  <li>Use variables like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">{"{{data.lead.email}}"}</code> for dynamic data</li>
                  <li>Save your workflow and toggle it to "Active"</li>
                </ol>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded-r-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Before using channels like WhatsApp, Telegram, or ChatGPT, configure your API credentials in Settings → Integrations.
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Available Workflow Triggers</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Lead Created:</strong> Triggered when a new lead is added</li>
                  <li><strong>Lead Updated:</strong> Triggered when lead details are modified</li>
                  <li><strong>Lead Stage Changed:</strong> Triggered when a lead's stage changes</li>
                  <li><strong>Lead Assigned:</strong> Triggered when a lead is assigned to a user</li>
                  <li><strong>Task Created:</strong> Triggered when a new task is created</li>
                  <li><strong>Task Completed:</strong> Triggered when a task is marked as complete</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Viewing Workflow Executions</h3>
                <p className="text-slate-700 mb-4">
                  Monitor your workflow executions from the Workflows page:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to "Workflows" page</li>
                  <li>Click "View Executions" on any workflow</li>
                  <li>See execution history with status (SUCCESS, FAILED, RUNNING, PENDING)</li>
                  <li>View input data (what triggered the workflow) and output data (results)</li>
                  <li>Check detailed error messages for failed executions</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Team Collaboration Section */}
          <section id="team-collaboration" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">8. Team Collaboration</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Inviting Team Members (Admin Only)</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to the "Team" page from the main menu</li>
                  <li>Click "Invite User" button</li>
                  <li>Enter the email address of the person you want to invite</li>
                  <li>Select their role (ADMIN or MEMBER)</li>
                  <li>Click "Send Invite"</li>
                  <li>The invited user will receive an email with an acceptance link</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Email Templates</h3>
                <p className="text-slate-700 mb-4">
                  Create reusable email templates:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to Settings → Email Templates</li>
                  <li>Click "Create Template"</li>
                  <li>Add subject and body with variables (e.g., {"{{lead.name}}"})</li>
                  <li>Use templates when sending emails from lead detail pages</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Integrations Section */}
          <section id="integrations" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">9. Integrations</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Configuring Integrations</h3>
                <p className="text-slate-700 mb-4">
                  Before using communication channels or AI features, configure your API credentials:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to "Settings" → "Integrations" from the main menu</li>
                  <li>Click "Configure" on the integration you want to set up</li>
                  <li>Enter your API credentials (e.g., WhatsApp API key, Telegram bot token, ChatGPT API key)</li>
                  <li>Click "Save" - credentials are encrypted and stored securely</li>
                  <li>You can now use these integrations in your workflows without entering credentials each time</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Available Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">WhatsApp</h4>
                    <p className="text-sm text-slate-600">Meta WhatsApp Business API integration for sending messages</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Telegram</h4>
                    <p className="text-sm text-slate-600">Telegram Bot API for automated messaging</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">SMS</h4>
                    <p className="text-sm text-slate-600">SMS gateway integration for text messaging</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">ChatGPT</h4>
                    <p className="text-sm text-slate-600">OpenAI API for AI-powered responses and content generation</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* API Reference Section */}
          <section id="api-reference" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">10. API Reference</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Authentication</h3>
                <p className="text-slate-700 mb-4">
                  All API requests require authentication using a JWT token. Include the token in the Authorization header:
                </p>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
                  <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Base URL</h3>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 mt-4 font-mono text-sm overflow-x-auto">
                  <code>https://your-domain.com/api</code>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Key Endpoints</h3>
                
                <div className="space-y-6 mt-6">
                  <div className="border-2 border-slate-200 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 mb-3 text-lg">Leads</h4>
                    <ul className="space-y-2 text-sm text-slate-700 font-mono">
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /leads</code> - List all leads</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">POST /leads</code> - Create a new lead</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /leads/:id</code> - Get lead details</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">PATCH /leads/:id</code> - Update lead</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">DELETE /leads/:id</code> - Delete lead</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /leads/export/csv</code> - Export leads to CSV</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">POST /leads/bulk/update</code> - Bulk update leads</li>
                    </ul>
                  </div>

                  <div className="border-2 border-slate-200 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 mb-3 text-lg">Workflows</h4>
                    <ul className="space-y-2 text-sm text-slate-700 font-mono">
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /workflows</code> - List all workflows</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">POST /workflows</code> - Create workflow</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /workflows/:id</code> - Get workflow details</li>
                      <li><code className="bg-slate-100 px-2 py-1 rounded">GET /workflows/:id/executions</code> - Get workflow executions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
              <p className="text-blue-100 mb-6">Explore our resources or get in touch</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/workflows/setup-guide"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                >
                  Workflow Setup Guide
                </Link>
                <Link
                  to="/upgrade"
                  className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
