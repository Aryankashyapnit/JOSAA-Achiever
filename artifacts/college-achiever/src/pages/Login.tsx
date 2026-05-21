import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLogin, useSignup } from "@workspace/api-client-react";
import { Loader2, ArrowRight, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRank, setSignupRank] = useState("");
  const [signupCategory, setSignupCategory] = useState("OPEN");
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  // ── Validation ──────────────────────────────────────────────────────────
  const validateLogin = () => {
    const errs: typeof loginErrors = {};
    if (!loginEmail || !/\S+@\S+\.\S+/.test(loginEmail)) errs.email = "Enter a valid email address.";
    if (!loginPassword || loginPassword.length < 6) errs.password = "Password must be at least 6 characters.";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = () => {
    const errs: typeof signupErrors = {};
    if (!signupName || signupName.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!signupEmail || !/\S+@\S+\.\S+/.test(signupEmail)) errs.email = "Enter a valid email address.";
    if (!signupPassword || signupPassword.length < 6) errs.password = "Password must be at least 6 characters.";
    setSignupErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit handlers ─────────────────────────────────────────────────────
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    loginMutation.mutate(
      { data: { email: loginEmail, password: loginPassword } },
      {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Incorrect email or password. Please try again.",
          });
        },
      },
    );
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    signupMutation.mutate(
      {
        data: {
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          jeeRank: signupRank ? parseInt(signupRank) : undefined,
          category: signupCategory,
        },
      },
      {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: "This email may already be registered. Try signing in instead.",
          });
        },
      },
    );
  };

  // ── Toggle between Login / Signup ───────────────────────────────────────
  const handleToggle = () => {
    setIsSignup((prev) => !prev);
    setLoginErrors({});
    setSignupErrors({});
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden md:flex flex-col justify-between flex-1 bg-indigo-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl p-2">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">College Achiever</span>
        </div>

        <div className="space-y-5 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Data-driven decisions for your dream college.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Navigate JOSAA counselling with confidence. Predict admissions, track cutoffs, and simulate rounds.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { value: "120+", label: "Institutes" },
              { value: "64K+", label: "Cutoff records" },
              { value: "6", label: "JOSAA rounds" },
              { value: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-indigo-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-sm">
          © {new Date().getFullYear()} College Achiever. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-6 py-10 sm:px-12">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 rounded-xl p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">College Achiever</span>
        </div>

        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {isSignup
                ? "Join thousands of JEE aspirants making smarter choices."
                : "Sign in to access your personalised dashboard."}
            </p>
          </div>

          {/* ── Login Form ── */}
          {!isSignup && (
            <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
              <Field label="Email Address" error={loginErrors.email}>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={fieldCls(!!loginErrors.email)}
                  data-testid="input-login-email"
                />
              </Field>

              <Field label="Password" error={loginErrors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={fieldCls(!!loginErrors.password) + " pr-11"}
                    data-testid="input-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
                data-testid="button-login-submit"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── Signup Form ── */}
          {isSignup && (
            <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
              <Field label="Full Name" error={signupErrors.name}>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Arjun Kumar"
                  autoComplete="name"
                  className={fieldCls(!!signupErrors.name)}
                  data-testid="input-signup-name"
                />
              </Field>

              <Field label="Email Address" error={signupErrors.email}>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="arjun@example.com"
                  autoComplete="email"
                  className={fieldCls(!!signupErrors.email)}
                  data-testid="input-signup-email"
                />
              </Field>

              <Field label="Password" error={signupErrors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={fieldCls(!!signupErrors.password) + " pr-11"}
                    data-testid="input-signup-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="JEE Rank (Optional)">
                  <input
                    type="number"
                    value={signupRank}
                    onChange={(e) => setSignupRank(e.target.value)}
                    placeholder="e.g. 5000"
                    min={1}
                    max={999999}
                    className={fieldCls(false)}
                    data-testid="input-signup-rank"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={signupCategory}
                    onChange={(e) => setSignupCategory(e.target.value)}
                    className={fieldCls(false) + " bg-white"}
                    data-testid="select-signup-category"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="OBC-NCL">OBC-NCL</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
                data-testid="button-signup-submit"
              >
                {signupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── Toggle ── */}
          <p className="text-sm text-slate-500 text-center mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={handleToggle}
              className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              data-testid="button-toggle-mode"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fieldCls(hasError: boolean) {
  return [
    "w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 focus:border-transparent transition-all",
    hasError
      ? "border-red-300 focus:ring-red-400/40"
      : "border-slate-200 focus:ring-indigo-400/40 hover:border-slate-300",
  ].join(" ");
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
