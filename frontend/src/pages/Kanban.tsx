import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { getKanbanView } from "@/api/leads";
import { updateLeadStage } from "@/api/leads";

const STAGES = ["NEW", "CONTACTED", "FOLLOW_UP", "WON", "LOST"];

export default function Kanban() {
  const [kanbanData, setKanbanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  useEffect(() => {
    loadKanban();
  }, []);

  async function loadKanban() {
    try {
      setLoading(true);
      const data = await getKanbanView();
      setKanbanData(data || []);
    } catch (err: any) {
      console.error("Failed to load kanban:", err);
      alert(`Failed to load kanban board: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleStageChange(leadId: string, newStage: string) {
    try {
      await updateLeadStage(leadId, newStage);
      await loadKanban(); // Reload to reflect changes
    } catch (err: any) {
      alert(`Failed to update lead stage: ${err.message || "Unknown error"}`);
    }
  }

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: string) => {
    if (!draggedLead) return;

    const lead = kanbanData
      .flatMap(col => col.leads)
      .find(l => l.id === draggedLead);

    if (lead && lead.stage !== stage) {
      await handleStageChange(draggedLead, stage);
    }

    setDraggedLead(null);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500">Loading kanban board...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline (Kanban)</h1>
          <p className="text-slate-600 mt-1">Drag and drop leads to change stages</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanData.map((column) => (
            <div
              key={column.stage}
              className="flex-shrink-0 w-80 bg-slate-50 rounded-xl p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.stage)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">{column.stage}</h2>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-700">
                  {column.count}
                </span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {column.leads.map((lead: any) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-move"
                  >
                    <Link
                      to={`/leads/${lead.id}`}
                      className="block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="font-semibold text-slate-900 mb-1">{lead.name}</div>
                      <div className="text-sm text-slate-600 space-y-1">
                        {lead.email && <div>{lead.email}</div>}
                        {lead.company && <div>{lead.company}</div>}
                        {lead.owner && (
                          <div className="text-xs text-slate-500">
                            Owner: {lead.owner.name || lead.owner.email}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {column.leads.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
