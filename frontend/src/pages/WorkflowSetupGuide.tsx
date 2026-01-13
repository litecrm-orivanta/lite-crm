import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

export default function WorkflowSetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const n8nUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5678"
    : window.location.protocol === 'https:' 
      ? "https://workflow.orivanta.ai"
      : "http://workflow.orivanta.ai";

  function openN8nInNewTab() {
    window.open(n8nUrl, '_blank');
  }

  const steps = [
    {
      id: 1,
      title: "Create a Workflow in n8n",
      description: "Set up your automation workflow in n8n",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-3">
              <strong>Step 1.1:</strong> Click the button below to open n8n in a new tab. Log in with your n8n account.
            </p>
            <button
              onClick={openN8nInNewTab}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Open n8n Editor →
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 1.2: Create New Workflow</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>In n8n, click <strong>"Add workflow"</strong> (top right) or use the "+" button</li>
              <li>Give your workflow a descriptive name (e.g., "Notify on New Lead")</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 1.3: Add Webhook Node</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Click the <strong>"+"</strong> button in the workflow canvas</li>
              <li>Search for <strong>"Webhook"</strong> and select it</li>
              <li>In the Webhook node settings:</li>
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>HTTP Method:</strong> POST</li>
                <li><strong>Path:</strong> Leave empty or use a descriptive path (e.g., <code className="bg-slate-100 px-1 rounded">lead-created</code>)</li>
                <li><strong>Response Mode:</strong> "Respond to Webhook"</li>
              </ul>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 1.4: Get Your Workflow ID</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Click the <strong>"Execute Node"</strong> button (play icon) on the Webhook node</li>
              <li>A webhook URL will appear, something like:</li>
              <div className="bg-slate-100 rounded p-2 mt-2 font-mono text-xs">
                {n8nUrl}/webhook/abc123def456
              </div>
              <li className="mt-2"><strong>Important:</strong> Copy the workflow ID from the URL (the part after <code className="bg-white px-1 rounded">/webhook/</code>)</li>
              <li>In the example above, the workflow ID is: <code className="bg-white px-1 rounded font-mono">abc123def456</code></li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>💡 Save this workflow ID!</strong> You'll need it in the next step to connect the workflow to CRM events.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Add Actions to Your Workflow",
      description: "Define what happens when the workflow receives data",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 2.1: Add Action Nodes</p>
            <p className="text-sm text-slate-700 mb-3">
              After the Webhook node, add nodes to process the data. Click the "+" button after the Webhook node:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <p className="font-medium text-sm mb-1">📧 Email Node</p>
                <p className="text-xs text-slate-600">Send email notifications when events occur</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <p className="font-medium text-sm mb-1">💬 Slack Node</p>
                <p className="text-xs text-slate-600">Send messages to Slack channels</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <p className="font-medium text-sm mb-1">📊 HTTP Request</p>
                <p className="text-xs text-slate-600">Call external APIs or services</p>
              </div>
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <p className="font-medium text-sm mb-1">💾 Database Node</p>
                <p className="text-xs text-slate-600">Store data in databases</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Understanding the Data:</strong> When Lite CRM sends data to your webhook, it will be in this format:
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
            <p className="text-xs text-blue-700 mt-2">
              Access data in n8n using: <code className="bg-white px-1 rounded">$json.data.lead.name</code>, <code className="bg-white px-1 rounded">$json.data.lead.email</code>, etc.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 2.2: Activate Workflow</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Click the <strong>"Active"</strong> toggle at the top right of the workflow</li>
              <li>Make sure it shows as <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">Active</span></li>
              <li>Save your workflow</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Connect Workflow to CRM Events",
      description: "Link your workflow to Lite CRM events",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900 mb-2">
              <strong>🎉 Great!</strong> Now that you have your workflow ID, you can connect it to CRM events right here in Lite CRM.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 3.1: Go to Workflow Configuration</p>
            <p className="text-sm text-slate-700 mb-3">
              Click the button below to open the Workflow Configuration page where you can connect your workflow to CRM events.
            </p>
            <Link
              to="/workflows/configuration"
              className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Open Workflow Configuration →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-2">Step 3.2: Add Configuration</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Click <strong>"+ Add Configuration"</strong> button</li>
              <li>Select the event you want to trigger (e.g., "Lead Created")</li>
              <li>Paste your workflow ID (from Step 1.4)</li>
              <li>Click <strong>"Save Configuration"</strong></li>
              <li>Toggle the configuration to <strong>"Active"</strong> (it's active by default)</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>That's it!</strong> Your workflow is now connected. When the selected event occurs in Lite CRM, 
              the workflow will automatically run in n8n.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Test Your Workflow",
      description: "Verify everything is working",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 4.1: Test in n8n (Optional)</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>In n8n, click <strong>"Execute Node"</strong> on your Webhook node</li>
              <li>Copy the sample data shown</li>
              <li>Add an HTTP Request node or Email node after the webhook</li>
              <li>Execute the workflow to test it</li>
              <li>Check that the output looks correct</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">Step 4.2: Test from Lite CRM</p>
            <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1 ml-2">
              <li>Go to Lite CRM Dashboard</li>
              <li>Create a new lead (if you configured <code className="bg-slate-100 px-1 rounded">lead.created</code> event)</li>
              <li>Or change a lead's stage (if you configured <code className="bg-slate-100 px-1 rounded">lead.stage.changed</code> event)</li>
              <li>Go back to n8n and check the <strong>"Executions"</strong> tab</li>
              <li>You should see a new execution with your data</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              <strong>✅ Success!</strong> If you see executions in n8n, your workflow is working correctly. 
              The workflow will now automatically run whenever the configured event occurs in Lite CRM.
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
              to="/workflows/editor"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Editor
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            Complete step-by-step guide to set up n8n workflows and connect them to Lite CRM events
          </p>
        </div>

        {/* Overview */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-900 mb-2">
            <strong>How It Works:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 ml-2">
            <li>Create a workflow in n8n with a Webhook node</li>
            <li>Copy the workflow ID from the webhook URL</li>
            <li>Connect the workflow to CRM events in Lite CRM (no coding required!)</li>
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
            <button
              onClick={openN8nInNewTab}
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Open n8n Editor →
            </button>
            <Link
              to="/workflows/editor"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Workflow Editor
            </Link>
            <a
              href="https://docs.n8n.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              n8n Documentation →
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
