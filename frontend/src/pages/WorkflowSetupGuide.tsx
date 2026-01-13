import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

export default function WorkflowSetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "Understanding Workflows",
      description: "Learn how workflows work in Lite CRM",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>What are Workflows?</strong>
            </p>
            <p className="text-sm text-blue-800">
              Workflows are automation scripts that run automatically when specific events occur in your CRM. 
              For example, when a new lead is created, a workflow can send an email notification or update an external system.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Workflow Setup Process</p>
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 ml-2">
              <li><strong>Administrator creates workflows</strong> - Workflows are set up by your system administrator</li>
              <li><strong>Workflows are available</strong> - Once created, workflows appear in your workflow list</li>
              <li><strong>You configure event mapping</strong> - Use the Configuration page to connect workflows to CRM events</li>
              <li><strong>Workflows run automatically</strong> - When events occur, workflows execute automatically</li>
            </ol>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> If you need to create or modify workflows, please contact your administrator. 
              You can configure which events trigger existing workflows using the Configuration page.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Configure Workflow Event Mapping",
      description: "Connect workflows to CRM events",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 2.1: Go to Workflow Configuration</p>
            <p className="text-sm text-slate-700 mb-3">
              Click the button below to open the Workflow Configuration page where you can connect workflows to CRM events.
            </p>
            <Link
              to="/workflows/configuration"
              className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Open Workflow Configuration →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 2.2: Add Configuration</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Click <strong>"+ Add Configuration"</strong> button</li>
              <li>Select the event you want to trigger (e.g., "Lead Created")</li>
              <li>Enter the workflow ID (provided by your administrator) or use the custom webhook URL</li>
              <li>Choose whether to use a custom webhook URL or default format</li>
              <li>Click <strong>"Save Configuration"</strong></li>
              <li>The configuration is active by default - toggle it off if you want to disable it</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Understanding the Data:</strong> When a workflow is triggered, it receives data in this format:
            </p>
            <pre className="bg-white rounded p-3 text-xs overflow-x-auto border border-blue-200">
{`{
  "event": "lead.created",
  "workspaceId": "workspace-123",
  "data": {
    "lead": {
      "id": "lead-456",
      "name": "John Doe",
      "email": "john@example.com",
      "stage": "NEW",
      ...
    }
  }
}`}
            </pre>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              <strong>🎉 That's it!</strong> Your workflow is now connected. When the selected event occurs in Lite CRM, 
              the workflow will automatically run.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Available CRM Events",
      description: "Events you can connect workflows to",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Lead Events</p>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">lead.created</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when a new lead is created in your CRM</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">lead.updated</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when lead details are updated</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">lead.stage.changed</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when lead stage changes (NEW → CONTACTED → WON/LOST)</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">lead.assigned</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when a lead is assigned to a user</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Task Events</p>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">task.created</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when a new task is created</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <code className="text-sm font-mono text-blue-600">task.completed</code>
                <p className="text-xs text-slate-600 mt-1">Triggered when a task is marked as completed</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Testing Your Configuration",
      description: "Verify your workflow configuration is working",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 4.1: Test from Lite CRM</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-2 ml-2">
              <li>Go to Lite CRM Dashboard</li>
              <li>Create a new lead (if you configured <code className="bg-slate-100 px-1 rounded">lead.created</code> event)</li>
              <li>Or change a lead's stage (if you configured <code className="bg-slate-100 px-1 rounded">lead.stage.changed</code> event)</li>
              <li>The workflow should automatically execute</li>
              <li>Check with your administrator to verify the workflow executed successfully</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Workflow Execution:</strong> Workflows execute automatically in the background. 
              You won't see execution status in the Lite CRM UI - contact your administrator if you need to verify execution.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              <strong>✅ Success!</strong> If your workflow executes correctly, it will continue to run automatically 
              whenever the configured event occurs in Lite CRM.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Workflow Setup Guide</h1>
            <Link
              to="/workflows/configuration"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Go to Configuration →
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            Complete guide to configuring workflows and connecting them to Lite CRM events
          </p>
        </div>

        {/* Overview */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-900 mb-2">
            <strong>How It Works:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 ml-2">
            <li>Workflows are created by your administrator</li>
            <li>Workflows become available in your workflow list</li>
            <li>You configure which CRM events trigger which workflows</li>
            <li>Workflows run automatically when events occur</li>
          </ol>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {step.id}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    activeStep === step.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeStep === step.id && (
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                  {step.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Event Reference */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
          <h3 className="font-semibold mb-4 text-slate-900">Available CRM Events</h3>
          <p className="text-sm text-slate-600 mb-4">
            You can connect workflows to any of these events. Each event sends different data to your workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { event: "lead.created", desc: "When a new lead is created" },
              { event: "lead.updated", desc: "When lead details are updated" },
              { event: "lead.stage.changed", desc: "When lead stage changes (NEW → CONTACTED → WON/LOST)" },
              { event: "lead.assigned", desc: "When a lead is assigned to a user" },
              { event: "task.created", desc: "When a new task is created" },
              { event: "task.completed", desc: "When a task is marked as completed" },
            ].map((item) => (
              <div key={item.event} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-blue-600">
                    {item.event}
                  </code>
                </div>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-lg bg-white border border-slate-200 p-4">
          <h3 className="font-semibold mb-3 text-slate-900">Next Steps</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/workflows/configuration"
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Configure Workflows →
            </Link>
            <Link
              to="/workflows"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              View Workflows
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
