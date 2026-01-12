import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import { Button } from "@/components/ui/button"
import { createLead } from "@/api/leads"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CreateLeadPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)

  const emailValid = !email || emailRegex.test(email)
  const canSubmit = name.trim().length > 0 && emailValid && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)

    await createLead({
      name: name.trim(),
      email: email || undefined,
      company: company || undefined,
    })

    navigate("/")
  }

  return (
    <AppShell>
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Create Lead</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!emailValid && (
            <p className="text-sm text-red-600">
              Invalid email format
            </p>
          )}

          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={!canSubmit}>
              Create
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
