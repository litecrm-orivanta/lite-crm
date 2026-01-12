import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  const { email, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="text-lg font-semibold">Lite CRM</div>

      <div className="flex items-center gap-4">
        {email && (
          <span className="text-sm text-slate-600">{email}</span>
        )}

        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
