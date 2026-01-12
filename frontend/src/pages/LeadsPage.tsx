import { useEffect, useState } from "react"
import { fetchLeads, updateLeadStage, Lead } from "@/api/leads"
import AppShell from "@/layouts/AppShell"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const STAGES = ["NEW", "CONTACTED", "WON", "LOST"] // 🔒 BACKEND-ALIGNED

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .finally(() => setLoading(false))
  }, [])

  async function onStageChange(id: string, stage: string) {
    await updateLeadStage(id, stage)
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage } : l))
    )
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Leads</h1>

          <Button asChild>
            <Link to="/leads/new">Create Lead</Link>
          </Button>
        </div>

        {loading ? (
          <div>Loading leads…</div>
        ) : leads.length === 0 ? (
          <div className="rounded border bg-white p-10 text-center">
            <h2 className="text-lg font-medium">No leads yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Get started by creating your first lead.
            </p>

            <Button asChild className="mt-4">
              <Link to="/leads/new">Create your first lead</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Stage</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="px-3 py-2">{lead.name}</td>
                    <td className="px-3 py-2">{lead.email ?? "-"}</td>
                    <td className="px-3 py-2">{lead.company ?? "-"}</td>
                    <td className="px-3 py-2">
                      <select
                        value={lead.stage}
                        onChange={(e) =>
                          onStageChange(lead.id, e.target.value)
                        }
                        className="rounded border px-2 py-1"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
