import AppLayout from "@/layouts/AppLayout";
import { Link } from "react-router-dom";
import LiteCRMLogo from "@/components/LiteCRMLogo";
import { WhatsAppLogo, TelegramLogo, SlackLogo, SMSLogo, ChatGPTLogo } from "@/components/ChannelLogos";

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
              Complete guide to using Lite CRM - Your all-in-one CRM solution
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
              <a href="#notes-timeline" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">6.</span> Notes & Timeline
              </a>
              <a href="#workflows" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">7.</span> Workflow Automation
              </a>
              <a href="#team-collaboration" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">8.</span> Team Collaboration
              </a>
              <a href="#reports-analytics" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">9.</span> Reports & Analytics
              </a>
              <a href="#integrations" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">10.</span> Integrations
              </a>
              <a href="#billing" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-2">
                <span className="text-blue-400">11.</span> Billing & Plans
              </a>
            </div>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">1. Overview</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                  Lite CRM is a modern Customer Relationship Management system designed for businesses of all sizes. 
                  It combines essential CRM features with native workflow automation, multi-channel messaging, and advanced analytics.
                </p>
                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Unlimited Lead Management</h4>
                      <p className="text-sm text-slate-600">Track and manage unlimited leads through your entire sales pipeline</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Native Workflow Automation</h4>
                      <p className="text-sm text-slate-600">Built-in workflow engine with visual editor - no external dependencies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
                      <p className="text-sm text-slate-600">Comprehensive reports and insights into your sales performance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Team Collaboration</h4>
                      <p className="text-sm text-slate-600">Invite team members, assign leads, and collaborate seamlessly</p>
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
                  <li>Verify your email with the OTP sent to your inbox</li>
                  <li>Choose between Individual (SOLO) or Organization (ORG) account type</li>
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
                  <li>Import leads from CSV files</li>
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

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Editing Lead Details</h3>
                <p className="text-slate-700 mb-4">
                  Update lead information anytime:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Click on any lead row in the Dashboard table</li>
                  <li>You'll be taken to the Lead Detail page</li>
                  <li>Edit any field (name, email, phone, company, stage, source, region)</li>
                  <li>Click "Save Lead" to update</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Bulk Operations</h3>
                <p className="text-slate-700 mb-4">
                  Select multiple leads and perform bulk actions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Bulk Update:</strong> Change stage, source, or region for multiple leads</li>
                  <li><strong>Bulk Assign:</strong> Assign multiple leads to a team member</li>
                  <li><strong>Bulk Delete:</strong> Remove multiple leads at once</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Filtering & Search</h3>
                <p className="text-slate-700 mb-4">
                  Find leads quickly using filters:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Stage Filter:</strong> Filter by NEW, CONTACTED, WON, or LOST</li>
                  <li><strong>Source Filter:</strong> Filter by lead source (Website, Ads, Referral, etc.)</li>
                  <li><strong>Region Filter:</strong> Filter by geographic region</li>
                  <li><strong>Search:</strong> Search by name, email, phone, or company</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Saved Filters</h3>
                <p className="text-slate-700 mb-4">
                  Save frequently used filter combinations:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Apply your desired filters (stage, source, region, search)</li>
                  <li>Click "Save Filter" button</li>
                  <li>Give it a name (e.g., "Hot Leads", "Q4 Prospects")</li>
                  <li>Access saved filters from the dropdown menu</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Importing Leads</h3>
                <p className="text-slate-700 mb-4">
                  Import leads from CSV files:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Click "Import Leads" button on the Dashboard</li>
                  <li>Select "Upload CSV File"</li>
                  <li>Choose your CSV file from your device</li>
                  <li>Preview the data and map columns to lead fields</li>
                  <li>Click "Import" to add all leads to your CRM</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Exporting Leads</h3>
                <p className="text-slate-700 mb-4">
                  Export lead data for external analysis:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Apply filters if you want to export specific leads</li>
                  <li>Click "Export to CSV" button</li>
                  <li>CSV file will download with all filtered leads</li>
                  <li>Open in Excel, Google Sheets, or any spreadsheet tool</li>
                </ol>
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

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Updating Lead Stages</h3>
                <p className="text-slate-700 mb-4">
                  Update lead stages in multiple ways:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>From Kanban:</strong> Drag a lead card to a different stage column</li>
                  <li><strong>From Dashboard:</strong> Use the stage dropdown in the leads table</li>
                  <li><strong>From Lead Detail:</strong> Update the stage field and save</li>
                  <li>Workflows can trigger automatically on stage changes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Calendar & Tasks Section */}
          <section id="calendar-tasks" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">5. Calendar & Tasks</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Creating a Task</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to a lead's detail page</li>
                  <li>Scroll to the "Tasks" section</li>
                  <li>Fill in task title and due date (required)</li>
                  <li>Optionally add notes for additional context</li>
                  <li>Click "Create Task"</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Managing Tasks</h3>
                <p className="text-slate-700 mb-4">
                  Organize and track your tasks:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Task Filters:</strong> View all tasks, today's tasks, or overdue tasks</li>
                  <li><strong>Mark Complete:</strong> Check off completed tasks to track progress</li>
                  <li><strong>Edit Tasks:</strong> Update task details, change due dates, or add notes</li>
                  <li><strong>Delete Tasks:</strong> Remove tasks that are no longer needed</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Calendar View</h3>
                <p className="text-slate-700 mb-4">
                  View all tasks organized by date:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Access from the "Calendar" link in the navigation</li>
                  <li>See all tasks organized by due date</li>
                  <li>Filter by date range</li>
                  <li>Click on tasks to view details and navigate to related leads</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Notes & Timeline Section */}
          <section id="notes-timeline" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">6. Notes & Activity Timeline</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Adding Notes</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to any lead's detail page</li>
                  <li>Scroll to the "Notes" section</li>
                  <li>Type your note in the text area</li>
                  <li>Click "Add Note" button</li>
                  <li>Notes are timestamped and show who created them</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Managing Notes</h3>
                <p className="text-slate-700 mb-4">
                  Edit or delete notes anytime:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Edit Notes:</strong> Click the edit icon, modify the text, and save</li>
                  <li><strong>Delete Notes:</strong> Click the delete icon to remove a note</li>
                  <li>All notes create an activity timeline showing interactions with the lead</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Activity Timeline</h3>
                <p className="text-slate-700 mb-4">
                  The notes section serves as an activity timeline:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>See all interactions in chronological order</li>
                  <li>Track conversation history and important decisions</li>
                  <li>Maintain a complete record of lead engagement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Workflows Section */}
          <section id="workflows" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">7. Workflow Automation</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Introduction to Workflows</h3>
                <p className="text-slate-700 mb-4">
                  Lite CRM includes a powerful built-in workflow automation system that allows you to automate repetitive tasks 
                  and integrate with various services using a visual editor.
                </p>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Creating a Workflow</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to "Workflows" from the main menu</li>
                  <li>Click "Create Workflow" button</li>
                  <li>You'll see the visual workflow editor with a node palette</li>
                  <li>Add a "Trigger" node and select an event (e.g., "Lead Created")</li>
                  <li>Add action nodes from the palette and configure them</li>
                  <li>Connect nodes by dragging from output handles to input handles</li>
                  <li>Use variables like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">{"{{data.lead.email}}"}</code> for dynamic data</li>
                  <li>Save your workflow and toggle it to "Active"</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Available Triggers</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>Lead Created:</strong> When a new lead is added</li>
                  <li><strong>Lead Updated:</strong> When lead details are modified</li>
                  <li><strong>Lead Stage Changed:</strong> When a lead's stage changes</li>
                  <li><strong>Lead Assigned:</strong> When a lead is assigned to a user</li>
                  <li><strong>Task Created:</strong> When a new task is created</li>
                  <li><strong>Task Completed:</strong> When a task is marked as complete</li>
                </ul>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-6">Workflow Actions</h3>
                <p className="text-slate-700 mb-6">
                  Available action nodes include:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 className="font-bold text-slate-900 text-lg">Communication</h4>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-2 ml-1">
                      <li className="flex items-center gap-2"><span className="text-blue-500">▸</span> Email</li>
                      <li className="flex items-center gap-2"><span className="text-blue-500">▸</span> WhatsApp</li>
                      <li className="flex items-center gap-2"><span className="text-blue-500">▸</span> Telegram</li>
                      <li className="flex items-center gap-2"><span className="text-blue-500">▸</span> Slack</li>
                      <li className="flex items-center gap-2"><span className="text-blue-500">▸</span> SMS</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <h4 className="font-bold text-slate-900 text-lg">Integration</h4>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-2 ml-1">
                      <li className="flex items-center gap-2"><span className="text-purple-500">▸</span> ChatGPT</li>
                      <li className="flex items-center gap-2"><span className="text-purple-500">▸</span> HTTP Request</li>
                      <li className="flex items-center gap-2"><span className="text-purple-500">▸</span> Webhook</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h4 className="font-bold text-slate-900 text-lg">Logic & Control</h4>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-2 ml-1">
                      <li className="flex items-center gap-2"><span className="text-emerald-500">▸</span> Condition</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500">▸</span> Delay</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500">▸</span> Loop</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <h4 className="font-bold text-slate-900 text-lg">Data Operations</h4>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-2 ml-1">
                      <li className="flex items-center gap-2"><span className="text-amber-500">▸</span> Set Variable</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">▸</span> Transform</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">▸</span> Filter</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">▸</span> Log</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Viewing Workflow Executions</h3>
                <p className="text-slate-700 mb-4">
                  Monitor your workflow executions:
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
                <p className="text-slate-700 mb-4">
                  Team invites are available for Organization plans:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to the "Team" page from the main menu</li>
                  <li>Click "Invite User" button</li>
                  <li>Enter the email address of the person you want to invite</li>
                  <li>Select their role (ADMIN or MEMBER)</li>
                  <li>Click "Send Invite"</li>
                  <li>The invited user will receive a premium email invitation</li>
                  <li>They can accept the invite and join your workspace</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Lead Assignment</h3>
                <p className="text-slate-700 mb-4">
                  Assign leads to team members for better organization:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>From Lead Detail:</strong> Use the "Assigned to" dropdown to assign a lead</li>
                  <li><strong>Bulk Assignment:</strong> Select multiple leads and assign them to a team member at once</li>
                  <li><strong>Team Filtering:</strong> Filter leads by assigned owner in the Dashboard</li>
                  <li>Workflows can trigger when leads are assigned to users</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Reports & Analytics Section */}
          <section id="reports-analytics" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">9. Reports & Analytics</h2>
              
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
              </div>
            </div>
          </section>

          {/* Integrations Section */}
          <section id="integrations" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">10. Integrations</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Configuring Integrations</h3>
                <p className="text-slate-700 mb-4">
                  Before using communication channels or AI features in workflows, configure your API credentials:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Go to "Settings" → "Integrations" from the main menu</li>
                  <li>Click "Configure" on the integration you want to set up</li>
                  <li>Enter your API credentials (e.g., WhatsApp API key, Telegram bot token, ChatGPT API key)</li>
                  <li>Click "Save" - credentials are encrypted and stored securely</li>
                  <li>You can now use these integrations in your workflows</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-6">Available Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {/* WhatsApp */}
                  <div className="group relative p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <WhatsAppLogo className="w-8 h-8 text-[#25D366]" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">WhatsApp</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">Meta WhatsApp Business API integration for sending automated messages via workflows</p>
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Business API</span>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className="group relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <TelegramLogo className="w-8 h-8 text-[#0088cc]" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Telegram</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">Telegram Bot API for automated messaging and notifications in workflows</p>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Bot API</span>
                    </div>
                  </div>

                  {/* SMS */}
                  <div className="group relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <SMSLogo className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">SMS</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">SMS gateway integration for text messaging and alerts in workflows</p>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Gateway</span>
                    </div>
                  </div>

                  {/* Slack */}
                  <div className="group relative p-6 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <SlackLogo className="w-8 h-8 text-[#4A154B]" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Slack</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">Post messages and notifications to Slack channels directly from workflows</p>
                    <div className="mt-4 pt-4 border-t border-violet-200">
                      <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-1 rounded-full">Webhooks</span>
                    </div>
                  </div>

                  {/* ChatGPT */}
                  <div className="group relative p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <ChatGPTLogo className="w-8 h-8 text-amber-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">ChatGPT</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">OpenAI API for AI-powered responses, content generation, and intelligent automation</p>
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">AI Powered</span>
                    </div>
                  </div>

                  {/* HTTP/Webhook */}
                  <div className="group relative p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">HTTP / Webhook</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">Make HTTP requests or send webhooks to integrate with any external service or API</p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">Universal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Section */}
          <section id="billing" className="mb-20">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">11. Billing & Plans</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-4">Plan Types</h3>
                <p className="text-slate-700 mb-4">
                  Lite CRM offers two account types:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg">Individual (SOLO)</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>✓ Personal CRM for solo users</li>
                      <li>✓ Starter & Professional plans</li>
                      <li>✓ Up to 1 user</li>
                      <li>✓ All core CRM features</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <h4 className="font-bold text-purple-900 mb-3 text-lg">Organization (ORG)</h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>✓ Team collaboration features</li>
                      <li>✓ Starter, Professional & Business plans</li>
                      <li>✓ Up to 5 users (Professional) or Unlimited (Business)</li>
                      <li>✓ Team invites & management</li>
                      <li>✓ Shared workflows & resources</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Upgrading Your Plan</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li>Navigate to "Upgrade" page from the main menu</li>
                  <li>Choose your billing period (Monthly, Quarterly, or Yearly)</li>
                  <li>Select a plan that fits your needs</li>
                  <li>Click "Select Plan" to proceed</li>
                  <li>Complete payment via Razorpay (secure payment gateway)</li>
                  <li>Your subscription is activated immediately after payment</li>
                </ol>

                <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Managing Billing</h3>
                <p className="text-slate-700 mb-4">
                  Access billing information from the Billing page:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>View Subscription:</strong> See your current plan, billing period, and renewal date</li>
                  <li><strong>Payment History:</strong> View all past invoices and payments</li>
                  <li><strong>Download Invoices:</strong> Download PDF invoices for accounting purposes</li>
                  <li><strong>Change Plan:</strong> Upgrade or downgrade your subscription anytime</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Quick Links with CTAs */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-10 text-center text-white shadow-2xl">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-blue-100 mb-8 text-lg">Start using Lite CRM today or explore more features</p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <Link
                    to="/"
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
                  >
                    Go to Dashboard →
                  </Link>
                  <Link
                    to="/workflows"
                    className="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
                  >
                    Create Workflow →
                  </Link>
                  <Link
                    to="/upgrade"
                    className="px-8 py-4 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
                  >
                    View Pricing →
                  </Link>
                </div>
                <div className="pt-6 border-t border-blue-400/30">
                  <p className="text-blue-100 text-sm mb-4">Need additional help? Contact our support team</p>
                  <a 
                    href="mailto:support@orivanta.ai" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@orivanta.ai
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
