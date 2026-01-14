import { createContext, useContext, useState } from "react"

type UserRole = "ADMIN" | "MEMBER" | null

type AuthContextType = {
  token: string | null
  email: string | null
  role: UserRole
  isSuperAdmin: boolean
  onboarded: boolean
  login: (token: string) => void
  signup: (token: string) => void
  completeOnboarding: () => void
  logout: () => void
}

function parseToken(token: string): { email: string | null; role: UserRole; isSuperAdmin: boolean } {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      email: payload.email || null,
      role: payload.role || null,
      isSuperAdmin: payload.isSuperAdmin || false,
    }
  } catch {
    return { email: null, role: null, isSuperAdmin: false }
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedToken = localStorage.getItem("token")
  const storedOnboarded = localStorage.getItem("onboarded") === "true"

  const parsed = storedToken ? parseToken(storedToken) : { email: null, role: null, isSuperAdmin: false }

  const [token, setToken] = useState<string | null>(storedToken)
  const [email, setEmail] = useState<string | null>(parsed.email)
  const [role, setRole] = useState<UserRole>(parsed.role)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(parsed.isSuperAdmin)
  const [onboarded, setOnboarded] = useState<boolean>(
    storedOnboarded || !!storedToken
  )

  const login = (t: string) => {
    const parsed = parseToken(t)
    localStorage.setItem("token", t)
    setToken(t)
    setEmail(parsed.email)
    setRole(parsed.role)
    setIsSuperAdmin(parsed.isSuperAdmin)
  }

  const signup = (t: string) => {
    const parsed = parseToken(t)
    localStorage.setItem("token", t)
    localStorage.setItem("onboarded", "true")
    setToken(t)
    setEmail(parsed.email)
    setRole(parsed.role)
    setIsSuperAdmin(parsed.isSuperAdmin)
    setOnboarded(true)
  }

  const completeOnboarding = () => {
    localStorage.setItem("onboarded", "true")
    setOnboarded(true)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("onboarded")
    setToken(null)
    setEmail(null)
    setRole(null)
    setIsSuperAdmin(false)
    setOnboarded(false)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,
        isSuperAdmin,
        onboarded,
        login,
        signup,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
