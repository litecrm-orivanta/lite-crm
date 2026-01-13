import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { listWorkflows, Workflow } from "@/api/workflows";

export default function WorkflowEditor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWorkflows() {
    setLoading(true);
    setError(null);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (err: any) {
      console.error("Failed to load workflows:", err);
      setError("Unable to load workflows. Workflows are managed and configured through the Workflow Configuration page.");
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workflows</h1>
            <p className="text-sm text-slate-600">
              View and manage automation workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/workflows/configuration"
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              ⚙️ Configure Workflows
            </Link>
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
                Workflows are automatically triggered when configured events occur in your CRM. 
                Use the Configuration page to connect workflows to CRM events like lead creation, stage changes, and more.
              </p>
              <Link
                to="/workflows/configuration"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Go to Workflow Configuration →
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
                No workflows configured
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Configure workflows to automatically trigger on CRM events. Workflows must be set up by your administrator and then configured here.
              </p>
              <Link
                to="/workflows/configuration"
                className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Configure Workflows →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Workflows</h2>
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
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <Link
                        to="/workflows/configuration"
                        className="block w-full text-center px-3 py-2 text-sm rounded border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                      >
                        Configure Event Mapping →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Guide */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
          <h3 className="font-semibold mb-4 text-slate-900">How Workflows Work</h3>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">1</span>
                Workflows Are Created by Administrator
              </p>
              <p className="ml-8 text-slate-600">
                Workflows are set up by your system administrator. Once created, they appear in your workflow list.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">2</span>
                Configure Event Mapping
              </p>
              <p className="ml-8 text-slate-600 mb-2">
                Connect workflows to CRM events using the Configuration page. Available events include:
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
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">3</span>
                Automatic Execution
              </p>
              <p className="ml-8 text-slate-600">
                Once configured, workflows automatically execute when the mapped events occur in your CRM. 
                No manual intervention required!
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-700">
            <strong>Need Help?</strong> Contact your administrator to create new workflows or modify existing ones. 
            Use the Configuration page to map workflows to CRM events.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
