import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { listWorkflows, Workflow } from "@/api/workflows";

export default function WorkflowEditor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n8nUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5678"
    : window.location.protocol === 'https:' 
      ? "https://workflow.orivanta.ai"
      : "http://workflow.orivanta.ai";

  async function loadWorkflows() {
    setLoading(true);
    setError(null);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (err: any) {
      console.error("Failed to load workflows:", err);
      setError("Unable to load workflows. You can still access n8n directly to create and manage workflows.");
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  function openN8nInNewTab() {
    window.open(n8nUrl, '_blank');
  }

  function openWorkflowInN8n(workflowId: string) {
    window.open(`${n8nUrl}/workflow/${workflowId}`, '_blank');
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workflow Editor</h1>
            <p className="text-sm text-slate-600">
              Create and manage automation workflows using n8n
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/workflows/configuration"
              className="px-4 py-2 text-sm rounded border border-green-300 text-green-700 hover:bg-green-50 font-medium"
            >
              ⚙️ Configure
            </Link>
            <button
              onClick={openN8nInNewTab}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Open n8n Editor →
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Workflow Management
              </p>
              <p className="text-sm text-blue-800 mb-2">
                Click "Open n8n Editor" to create and edit workflows in n8n's powerful visual editor. 
                Workflows created in n8n will automatically appear here once configured.
              </p>
              <Link
                to="/workflows/setup-guide"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                📖 View Detailed Setup Guide →
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {/* Workflows List */}
        {loading ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No workflows found
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Get started by creating your first workflow in n8n. Click the button above to open n8n's visual editor.
              </p>
              <button
                onClick={openN8nInNewTab}
                className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Create Your First Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Workflows</h2>
              <button
                onClick={loadWorkflows}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        workflow.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {workflow.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">
                      <span className="font-mono">ID: {workflow.id.substring(0, 12)}...</span>
                    </div>
                    {workflow.updatedAt && (
                      <div className="text-xs text-slate-400">
                        Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      onClick={() => openWorkflowInN8n(workflow.id)}
                      className="w-full mt-3 px-3 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Edit in n8n →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Guide */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
          <h3 className="font-semibold mb-4 text-slate-900">Getting Started with Workflows</h3>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">1</span>
                Create a Webhook Workflow
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1 text-slate-600">
                <li>Open n8n editor (click button above)</li>
                <li>Create a new workflow</li>
                <li>Add a "Webhook" node (HTTP Method: POST)</li>
                <li>Copy the webhook URL path (e.g., /webhook/your-workflow-id)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">2</span>
                Configure Events (Optional)
              </p>
              <p className="ml-8 text-slate-600 mb-2">
                Set environment variables to automatically trigger workflows on CRM events:
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1 text-slate-600">
                <li><code className="bg-slate-200 px-1 rounded">N8N_WORKFLOW_LEAD_CREATED=your-workflow-id</code></li>
                <li><code className="bg-slate-200 px-1 rounded">N8N_WORKFLOW_LEAD_STAGE_CHANGED=your-workflow-id</code></li>
                <li><code className="bg-slate-200 px-1 rounded">N8N_WORKFLOW_LEAD_ASSIGNED=your-workflow-id</code></li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">3</span>
                Available CRM Events
              </p>
              <div className="ml-8 grid grid-cols-2 gap-2">
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">lead.created</code>
                </div>
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">lead.updated</code>
                </div>
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">lead.stage.changed</code>
                </div>
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">lead.assigned</code>
                </div>
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">task.created</code>
                </div>
                <div className="bg-white rounded p-2 border border-slate-200">
                  <code className="text-xs">task.completed</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-700">
            <strong>Need Help?</strong> Check out the n8n documentation at{" "}
            <a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              docs.n8n.io
            </a>
            {" "}for workflow examples and tutorials.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
