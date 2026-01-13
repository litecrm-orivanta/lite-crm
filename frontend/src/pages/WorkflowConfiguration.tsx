import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { apiFetch } from "@/api/apiFetch";

export interface WorkflowConfig {
  id: string;
  event: string;
  workflowId: string;
  webhookUrl: string | null;
  useCustomUrl: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AVAILABLE_EVENTS = [
  { value: "lead.created", label: "Lead Created", description: "When a new lead is created" },
  { value: "lead.updated", label: "Lead Updated", description: "When lead details are updated" },
  { value: "lead.stage.changed", label: "Lead Stage Changed", description: "When lead stage changes (NEW → CONTACTED → WON/LOST)" },
  { value: "lead.assigned", label: "Lead Assigned", description: "When a lead is assigned to a user" },
  { value: "task.created", label: "Task Created", description: "When a new task is created" },
  { value: "task.completed", label: "Task Completed", description: "When a task is marked as completed" },
];

export default function WorkflowConfiguration() {
  const [configs, setConfigs] = useState<WorkflowConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({ event: "", workflowId: "", useCustomUrl: false, webhookUrl: "", active: true });

  const n8nUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5678"
    : window.location.protocol === 'https:' 
      ? "https://workflow.orivanta.ai"
      : "http://workflow.orivanta.ai";

  async function loadConfigurations() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/workflows/config");
      setConfigs(response.configurations || []);
    } catch (err: any) {
      console.error("Failed to load configurations:", err);
      setError("Failed to load workflow configurations");
    } finally {
      setLoading(false);
    }
  }

  async function saveConfiguration(event: string, workflowId: string, useCustomUrl: boolean, webhookUrl: string | null, active: boolean) {
    setSaving(event);
    setError(null);
    try {
      await apiFetch("/workflows/config", {
        method: "PUT",
        body: JSON.stringify({ event, workflowId, useCustomUrl, webhookUrl: useCustomUrl ? webhookUrl : null, active }),
      });
      await loadConfigurations();
      setShowAddForm(false);
      setNewConfig({ event: "", workflowId: "", useCustomUrl: false, webhookUrl: "", active: true });
    } catch (err: any) {
      setError(err?.message || "Failed to save configuration");
    } finally {
      setSaving(null);
    }
  }

  async function deleteConfiguration(event: string) {
    if (!confirm(`Are you sure you want to remove the workflow configuration for "${event}"?`)) {
      return;
    }
    setSaving(event);
    setError(null);
    try {
      await apiFetch(`/workflows/config/${encodeURIComponent(event)}`, {
        method: "DELETE",
      });
      await loadConfigurations();
    } catch (err: any) {
      setError(err?.message || "Failed to delete configuration");
    } finally {
      setSaving(null);
    }
  }

  async function toggleActive(config: WorkflowConfig) {
    await saveConfiguration(config.event, config.workflowId, config.useCustomUrl, config.webhookUrl, !config.active);
  }

  useEffect(() => {
    loadConfigurations();
  }, []);

  const configuredEvents = new Set(configs.map(c => c.event));
  const availableEventsToAdd = AVAILABLE_EVENTS.filter(e => !configuredEvents.has(e.value));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workflow Configuration</h1>
            <p className="text-sm text-slate-600">
              Connect CRM events to n8n workflows
            </p>
          </div>
          <Link
            to="/workflows/setup-guide"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            📖 Setup Guide →
          </Link>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-900 mb-2">
            <strong>How It Works:</strong> Configure which n8n workflows should run when events occur in your CRM. 
            When a configured event happens (like a lead being created), Lite CRM automatically triggers the connected workflow.
          </p>
          <p className="text-xs text-blue-700">
            Don't have workflow IDs yet? <Link to="/workflows/setup-guide" className="underline font-medium">Check the setup guide</Link> to learn how to create workflows and get their IDs.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Add New Configuration */}
        {showAddForm && availableEventsToAdd.length > 0 && (
          <div className="rounded-lg bg-white border border-slate-200 p-4">
            <h3 className="font-semibold mb-4">Add Workflow Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event
                </label>
                <select
                  value={newConfig.event}
                  onChange={(e) => setNewConfig({ ...newConfig, event: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select an event...</option>
                  {availableEventsToAdd.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.label} - {event.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  n8n Workflow ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newConfig.workflowId}
                  onChange={(e) => setNewConfig({ ...newConfig, workflowId: e.target.value })}
                  placeholder="e.g., kSeWTMmHdaA134gzYQVwq"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get this from n8n workflow URL: {n8nUrl}/workflow/<strong>your-workflow-id</strong>
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={newConfig.useCustomUrl}
                    onChange={(e) => setNewConfig({ ...newConfig, useCustomUrl: e.target.checked, webhookUrl: e.target.checked ? newConfig.webhookUrl : "" })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Use custom webhook URL
                  </span>
                </label>
                {newConfig.useCustomUrl ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Custom Webhook URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newConfig.webhookUrl}
                      onChange={(e) => setNewConfig({ ...newConfig, webhookUrl: e.target.value })}
                      placeholder="e.g., http://localhost:5678/webhook-test/lead-created"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the full webhook URL from n8n (test or production). 
                      Example: <code className="bg-slate-100 px-1 rounded">http://localhost:5678/webhook-test/lead-created</code>
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Default URL format:</strong> {n8nUrl}/webhook/<strong>{"{workflowId}"}</strong>
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      The webhook URL will be automatically constructed using the workflow ID above.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => saveConfiguration(newConfig.event, newConfig.workflowId, newConfig.useCustomUrl, newConfig.webhookUrl || null, newConfig.active)}
                  disabled={!newConfig.event || !newConfig.workflowId || (newConfig.useCustomUrl && !newConfig.webhookUrl) || saving !== null}
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewConfig({ event: "", workflowId: "", useCustomUrl: false, webhookUrl: "", active: true });
                  }}
                  className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configurations List */}
        {loading ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Loading configurations...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No workflow configurations yet
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Get started by connecting your first CRM event to an n8n workflow
              </p>
              {availableEventsToAdd.length > 0 ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  + Add Configuration
                </button>
              ) : (
                <Link
                  to="/workflows/setup-guide"
                  className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  📖 Learn How to Set Up Workflows
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Configured Workflows</h2>
              {availableEventsToAdd.length > 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  + Add Configuration
                </button>
              )}
            </div>
            <div className="space-y-3">
              {configs.map((config) => {
                const eventInfo = AVAILABLE_EVENTS.find(e => e.value === config.event);
                return (
                  <div
                    key={config.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {eventInfo?.label || config.event}
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.active}
                              onChange={() => toggleActive(config)}
                              disabled={saving === config.event}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm text-slate-600">
                              {config.active ? "Active" : "Inactive"}
                            </span>
                          </label>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {eventInfo?.description || config.event}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-slate-500">Workflow ID: </span>
                              <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">
                                {config.workflowId}
                              </code>
                            </div>
                            <a
                              href={`${n8nUrl}/workflow/${config.workflowId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Open in n8n →
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500">Webhook URL: </span>
                            {config.useCustomUrl && config.webhookUrl ? (
                              <code className="bg-blue-50 px-2 py-1 rounded font-mono text-xs text-blue-700 border border-blue-200 break-all">
                                {config.webhookUrl}
                              </code>
                            ) : (
                              <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs text-slate-700">
                                {n8nUrl}/webhook/{config.workflowId}
                              </code>
                            )}
                            <span className="text-xs text-slate-400 ml-2">
                              ({config.useCustomUrl ? "custom" : "default"})
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteConfiguration(config.event)}
                        disabled={saving === config.event}
                        className="ml-4 px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <h3 className="font-semibold mb-3 text-slate-900">Need Help?</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/workflows/setup-guide"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-white font-medium"
            >
              📖 Setup Guide
            </Link>
            <Link
              to="/workflows/editor"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-white font-medium"
            >
              Workflow Editor
            </Link>
            <a
              href={n8nUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-white font-medium"
            >
              Open n8n →
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
