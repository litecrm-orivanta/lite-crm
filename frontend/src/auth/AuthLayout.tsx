import { ReactNode } from "react"

export default function AuthLayout({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-center">{title}</h1>
        {children}
        {footer && (
          <div className="text-center text-sm text-slate-600">{footer}</div>
        )}
      </div>
    </div>
  )
}
