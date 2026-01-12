import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/AuthContext"

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Future: send this to backend
    completeOnboarding()
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-semibold">Welcome to Lite CRM</h1>
        <p className="text-sm text-slate-600">
          Tell us a bit about yourself to get started.
        </p>

        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <Button className="w-full">Continue</Button>
      </form>
    </div>
  )
}
