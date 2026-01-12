import { useState } from "react";
import { http } from "@/api/http";
import { useAuth } from "@/auth/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await http("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(res.accessToken || res.token);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
