import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLogin, useSignup } from "@workspace/api-client-react";
import { Loader2, ArrowRight, GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "login" | "signup" | "forgot";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
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

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotName, setForgotName] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotErrors, setForgotErrors] = useState<{
    email?: string; name?: string; password?: string; confirm?: string;
  }>({});
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const validateForgot = () => {
    const errs: typeof forgotErrors = {};
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) errs.email = "Enter a valid email address.";
    if (!forgotName || forgotName.trim().length < 2) errs.name = "Enter the name you registered with.";
    if (!forgotNewPassword || forgotNewPassword.length < 6) errs.password = "Password must be at least 6 characters.";
    if (forgotConfirm !== forgotNewPassword) errs.confirm = "Passwords do not match.";
    setForgotErrors(errs);
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgot()) return;
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          name: forgotName,
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: data.error ?? "Could not reset your password. Please check your details.",
        });
      } else {
        setForgotSuccess(true);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setLoginErrors({});
    setSignupErrors({});
    setForgotErrors({});
    setForgotSuccess(false);
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

          {/* ══════════════ LOGIN ══════════════ */}
          {mode === "login" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 mt-1 text-sm">Sign in to access your personalised dashboard.</p>
              </div>

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

                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="text-sm text-slate-500 text-center mt-6">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  data-testid="button-toggle-mode"
                >
                  Create one
                </button>
              </p>
            </>
          )}

          {/* ══════════════ SIGNUP ══════════════ */}
          {mode === "signup" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create your account</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Join thousands of JEE aspirants making smarter choices.
                </p>
              </div>

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

              <p className="text-sm text-slate-500 text-center mt-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  data-testid="button-toggle-mode"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ══════════════ FORGOT PASSWORD ══════════════ */}
          {mode === "forgot" && (
            <>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 -ml-1 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>

              {forgotSuccess ? (
                <div className="flex flex-col items-center text-center gap-4 py-6">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Password reset!</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                      Your password has been updated successfully.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Sign in with new password <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Reset password</h2>
                    <p className="text-slate-500 mt-1 text-sm">
                      Enter your registered email and name to verify your identity, then set a new password.
                    </p>
                  </div>

                  <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
                    <Field label="Registered Email" error={forgotErrors.email}>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={fieldCls(!!forgotErrors.email)}
                      />
                    </Field>

                    <Field label="Full Name (as registered)" error={forgotErrors.name}>
                      <input
                        type="text"
                        value={forgotName}
                        onChange={(e) => setForgotName(e.target.value)}
                        placeholder="Arjun Kumar"
                        autoComplete="name"
                        className={fieldCls(!!forgotErrors.name)}
                      />
                    </Field>

                    <Field label="New Password" error={forgotErrors.password}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          autoComplete="new-password"
                          className={fieldCls(!!forgotErrors.password) + " pr-11"}
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

                    <Field label="Confirm New Password" error={forgotErrors.confirm}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={forgotConfirm}
                        onChange={(e) => setForgotConfirm(e.target.value)}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className={fieldCls(!!forgotErrors.confirm)}
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      {forgotLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Reset Password <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          )}

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
