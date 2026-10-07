import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../services/api";
import type { Role } from "../types";

const ROLES: Role[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "LAB_STAFF",
  "PHARMACIST",
  "ACCOUNTANT",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "RECEPTIONIST" as Role,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F7FA] to-[#C9D9E3] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold text-ink">MediCore</span>
        </div>

        <div className="bg-surface rounded-xl shadow-xl p-8">
          <h2 className="font-display text-2xl font-bold text-ink mb-1">Create account</h2>
          <p className="text-sm text-ink-muted mb-6">Set up staff access to MediCore.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Username</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value as Role)}
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary outline-none bg-surface"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-light px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-ink-muted text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
