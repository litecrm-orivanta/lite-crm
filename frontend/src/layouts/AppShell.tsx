import { ReactNode } from "react"
import { Link } from "react-router-dom"
import Topbar from "@/layouts/Topbar"

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-white p-4">
        <nav className="space-y-1">
          <Link
            to="/"
            className="block rounded px-3 py-2 text-sm hover:bg-slate-100"
          >
            Leads
          </Link>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
