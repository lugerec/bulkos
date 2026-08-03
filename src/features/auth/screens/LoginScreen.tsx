import { useState } from "react";
import { C } from "../../../shared/ui";
import { useAuthStore } from "../../../store/authStore";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!email || !password) return;

    if (mode === "login") {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: "#050505", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-[390px] rounded-[20px] p-6 card-lit"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/BulkOS-logo.svg"
            alt="BulkOS"
            className="h-11 mb-4"
          />

          <p className="text-sm" style={{ color: C.fg2 }}>
            Lean bulk operating system
          </p>
        </div>

        <div className="flex mb-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <button
            onClick={() => setMode("login")}
            className="flex-1 py-3 text-sm font-bold"
            style={{
              background: mode === "login" ? C.accent : C.card,
              color: mode === "login" ? C.bg : C.fg2,
            }}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className="flex-1 py-3 text-sm font-bold"
            style={{
              background: mode === "register" ? C.accent : C.card,
              color: mode === "register" ? C.bg : C.fg2,
            }}
          >
            Register
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="email"
            className="w-full px-4 py-4 rounded-2xl outline-none text-sm"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="current-password"
            className="w-full px-4 py-4 rounded-2xl outline-none text-sm"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          />

          {error && (
            <p className="text-xs" style={{ color: C.red }}>
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold mt-2"
            style={{
              background: C.accent,
              color: C.onAccent,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}