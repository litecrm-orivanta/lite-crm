import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { listWorkflows, deleteWorkflow, getWorkflowExecutions, Workflow, WorkflowExecution } from "@/api/workflows";
import { listWorkflowTemplates, instantiateWorkflowTemplate, WorkflowTemplate } from "@/api/workflow-templates";
import { useToastContext } from "@/contexts/ToastContext";
import { useDialogContext } from "@/contexts/DialogContext";

export default function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"workflows" | "templates">("workflows");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [executions, setExecutions] = useState<Record<string, WorkflowExecution[]>>({});
  const [loadingExecutions, setLoadingExecutions] = useState<Record<string, boolean>>({});
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const toast = useToastContext();
  const dialog = useDialogContext();

  async function loadWorkflows() {
    setLoading(true);
    try {
      console.log("Loading workflows...");
      const data = await listWorkflows();
      console.log("Workflows loaded:", data);
      setWorkflows(data || []);
    } catch (err: any) {
      console.error("Failed to load workflows:", err);
      const errorMessage = err?.message || err?.toString() || "Unknown error";
      toast.error(`Failed to load workflows: ${errorMessage}`);
      setWorkflows([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = await dialog.confirm({
      title: "Delete Workflow",
      message: `Are you sure you want to delete workflow "${name}"?`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteWorkflow(id);
      loadWorkflows();
    } catch (err: any) {
      toast.error("Failed to delete workflow: " + (err.message || "Unknown error"));
    }
  }

  async function loadExecutions(workflowId: string) {
    if (loadingExecutions[workflowId]) return;
    
    setLoadingExecutions(prev => ({ ...prev, [workflowId]: true }));
    try {
      const data = await getWorkflowExecutions(workflowId, 20);
      setExecutions(prev => ({ ...prev, [workflowId]: data || [] }));
    } catch (err: any) {
      console.error("Failed to load executions:", err);
      setExecutions(prev => ({ ...prev, [workflowId]: [] }));
    } finally {
      setLoadingExecutions(prev => ({ ...prev, [workflowId]: false }));
    }
  }

  function toggleWorkflowDetails(workflowId: string) {
    if (selectedWorkflow === workflowId) {
      setSelectedWorkflow(null);
    } else {
      setSelectedWorkflow(workflowId);
      if (!executions[workflowId]) {
        loadExecutions(workflowId);
      }
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (activeTab === "templates") {
      loadTemplates();
    }
  }, [activeTab]);

  async function loadTemplates() {
    try {
      setTemplatesLoading(true);
      const data = await listWorkflowTemplates({
        search: templateSearch || undefined,
        category: templateCategory || undefined,
        tags: templateTags
          ? templateTags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : undefined,
      });
      setTemplates(data || []);
    } catch (err: any) {
      toast.error(`Failed to load templates: ${err?.message || "Unknown error"}`);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function handleUseTemplate(template: WorkflowTemplate) {
    try {
      const result = await instantiateWorkflowTemplate(template.id);
      if (result?.id) {
        toast.success("Template applied. Opening workflow...");
        navigate(`/workflows/editor/${result.id}`);
      } else {
        toast.success("Template applied.");
        navigate("/workflows");
      }
    } catch (err: any) {
      toast.error(`Failed to use template: ${err?.message || "Unknown error"}`);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workflows</h1>
            <p className="text-sm text-slate-600">
              Create and manage automation workflows
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/workflows/editor")}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              + Create Workflow
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Browse Templates
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("workflows")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "workflows"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            My Workflows
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "templates"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Templates
          </button>
        </div>

        {activeTab === "workflows" && (loading ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No workflows yet
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Create your first workflow to automate tasks and processes.
              </p>
              <button
                onClick={() => navigate("/workflows/editor")}
                className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Create Workflow →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-lg border border-slate-200 bg-white overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-sm text-slate-600 mt-1">{workflow.description}</p>
                      )}
                    </div>
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
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>Nodes: {workflow.nodes?.length || 0}</span>
                    <span>•</span>
                    <span>Edges: {workflow.edges?.length || 0}</span>
                    {workflow.updatedAt && (
                      <>
                        <span>•</span>
                        <span>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/workflows/editor/${workflow.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm rounded border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleWorkflowDetails(workflow.id)}
                      className="flex-1 text-center px-3 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      {selectedWorkflow === workflow.id ? "Hide" : "View"} Executions
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.id, workflow.name)}
                      className="flex-1 text-center px-3 py-2 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Execution History */}
                {selectedWorkflow === workflow.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-semibold text-sm mb-3">Execution History</h4>
                    {loadingExecutions[workflow.id] ? (
                      <div className="text-center py-4 text-slate-500 text-sm">Loading executions...</div>
                    ) : !executions[workflow.id] || executions[workflow.id].length === 0 ? (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        No executions yet. Workflow will execute when trigger events occur.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {executions[workflow.id].map((exec) => (
                          <div
                            key={exec.id}
                            className="bg-white rounded border border-slate-200 p-3 text-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  exec.status === "SUCCESS"
                                    ? "bg-green-100 text-green-800"
                                    : exec.status === "FAILED"
                                    ? "bg-red-100 text-red-800"
                                    : exec.status === "RUNNING"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {exec.status}
                              </span>
                              <span className="text-xs text-slate-500">
                                {exec.startedAt
                                  ? new Date(exec.startedAt).toLocaleString()
                                  : new Date(exec.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {exec.error && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                <strong>Error:</strong> {exec.error}
                              </div>
                            )}
                            {exec.input && (
                              <details className="mt-2">
                                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                                  View Input Data
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(exec.input, null, 2)}
                                </pre>
                              </details>
                            )}
                            {exec.output && (
                              <details className="mt-2">
                                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                                  View Output Data
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(exec.output, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {activeTab === "templates" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap gap-3">
              <input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                onBlur={loadTemplates}
                placeholder="Search templates"
                className="flex-1 min-w-[220px] px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <input
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                onBlur={loadTemplates}
                placeholder="Category"
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <input
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
                onBlur={loadTemplates}
                placeholder="Tags (comma-separated)"
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <button
                onClick={loadTemplates}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Search
              </button>
            </div>

            {templatesLoading ? (
              <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
                <p className="text-slate-500">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
                <p className="text-slate-500">No templates found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                        {template.complexity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-3">
                      {template.category} • {template.tags?.join(", ")}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded text-sm hover:bg-slate-50"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-slate-400">✕</button>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p><strong>Category:</strong> {selectedTemplate.category}</p>
                <p><strong>Tags:</strong> {selectedTemplate.tags?.join(", ")}</p>
                <p><strong>Complexity:</strong> {selectedTemplate.complexity}</p>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>
                  <strong>Nodes:</strong> {selectedTemplate.latestVersion?.nodes?.length || 0} •{" "}
                  <strong>Edges:</strong> {selectedTemplate.latestVersion?.edges?.length || 0}
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
