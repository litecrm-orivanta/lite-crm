import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import {
  listWorkflows,
  getWorkflowExecutions,
  Workflow,
  WorkflowExecution,
} from "@/api/workflows";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(
    null
  );
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);

  async function loadWorkflows() {
    setLoading(true);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
      // If no workflows, that's okay - user can create them
      if (data.length === 0) {
        console.log("No workflows found. This is normal if you haven't created any yet.");
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
      // Don't show alert - just log and show empty state
      // The user can still use the editor to create workflows
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadExecutions(workflowId: string) {
    setExecutionsLoading(true);
    try {
      const data = await getWorkflowExecutions(workflowId);
      setExecutions(data);
    } catch (err) {
      console.error("Failed to load executions:", err);
    } finally {
      setExecutionsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      loadExecutions(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-sm text-slate-600">
            Manage n8n workflows and view execution history
          </p>
        </div>

        {/* WORKFLOW EDITOR BUTTON */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 mb-1">
                <strong>Workflow Editor:</strong> Create and edit automation workflows
              </p>
              <p className="text-xs text-blue-600">
                Build workflows that trigger on CRM events like lead creation, stage changes, and more
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/workflows/configuration"
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium inline-block"
              >
                ⚙️ Configure Workflows
              </Link>
              <Link
                to="/workflows/setup-guide"
                className="px-4 py-2 text-sm rounded border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium inline-block"
              >
                📖 Setup Guide
              </Link>
            </div>
          </div>
        </div>

        {/* WORKFLOWS LIST */}
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="rounded-lg bg-white shadow p-8 text-center">
            <p className="text-slate-600 mb-2">
              No workflows found yet.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Configure workflows to automatically trigger on CRM events. Workflows are set up by your administrator and configured here.
            </p>
            <Link
              to="/workflows/configuration"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Configure Workflows →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`rounded-lg border p-4 cursor-pointer transition ${
                  selectedWorkflow === workflow.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      workflow.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {workflow.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ID: {workflow.id.substring(0, 8)}...
                </p>
                {workflow.updatedAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EXECUTIONS */}
        {selectedWorkflow && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b p-4">
              <h2 className="font-semibold">Execution History</h2>
              <p className="text-sm text-slate-600">
                Recent executions for selected workflow
              </p>
            </div>
            {executionsLoading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : executions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No executions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Mode</th>
                      <th className="px-4 py-3 text-left">Started</th>
                      <th className="px-4 py-3 text-left">Finished</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map((exec) => (
                      <tr key={exec.id} className="border-t">
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              exec.finished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exec.finished ? "Finished" : "Running"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {exec.mode}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(exec.startedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {exec.stoppedAt
                            ? new Date(exec.stoppedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INTEGRATION GUIDE */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Integration Guide</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="font-medium mb-1">1. Create a Webhook in n8n:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Add a "Webhook" node to your workflow</li>
                <li>Use method: POST</li>
                <li>Copy the webhook URL (e.g., /webhook/your-workflow-id)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">2. Configure Environment Variables:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    N8N_WORKFLOW_LEAD_CREATED=your-workflow-id
                  </code>
                </li>
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    N8N_WORKFLOW_LEAD_STAGE_CHANGED=your-workflow-id
                  </code>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">3. Available Events:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    lead.created
                  </code>
                </li>
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    lead.updated
                  </code>
                </li>
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    lead.stage.changed
                  </code>
                </li>
                <li>
                  <code className="bg-slate-200 px-1 rounded">
                    lead.assigned
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
