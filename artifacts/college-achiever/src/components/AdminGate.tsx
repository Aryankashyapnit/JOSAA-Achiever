import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShieldCheck, Eye, EyeOff, X, Lock } from "lucide-react";
import AdminUpload from "@/pages/AdminUpload";

const TRIGGER_SEQUENCE = "openadmin";
const ADMIN_PASSWORD = "admin123";

interface AdminGateProps {
  defaultOpen?: boolean;
  onDismiss?: () => void;
  contentOverride?: ReactNode;
}

export default function AdminGate({ defaultOpen = false, onDismiss, contentOverride }: AdminGateProps) {
  const [showModal, setShowModal] = useState(defaultOpen);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const bufferRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdminAuthenticated || showModal) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key.length === 1) {
        bufferRef.current = (bufferRef.current + e.key).slice(-TRIGGER_SEQUENCE.length);
        if (bufferRef.current === TRIGGER_SEQUENCE) {
          bufferRef.current = "";
          setShowModal(true);
          setPassword("");
          setError("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminAuthenticated, showModal, defaultOpen]);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setShowModal(false);
      setPassword("");
      setError("");
    } else {
      setError("Incorrect secret. Access denied.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPassword("");
    setError("");
    if (onDismiss) onDismiss();
  };

  if (isAdminAuthenticated) {
    return (
      <div className="mt-8 pt-8 border-t border-slate-200">
        {contentOverride ?? <AdminUpload />}
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden transition-transform ${shake ? "animate-[shake_0.4s_ease]" : ""}`}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

        <div className="px-6 pt-6 pb-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-xl p-2.5">
                <Lock className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base leading-tight">Admin Access</h2>
                <p className="text-slate-500 text-xs mt-0.5">Restricted area</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              style={{ pointerEvents: "auto" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium block">
                Admin Secret
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter secret key"
                  autoComplete="off"
                  className={`
                    w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-10
                    text-sm text-white placeholder:text-slate-600
                    focus:outline-none focus:ring-2 transition-all
                    ${error
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : "border-white/10 focus:ring-indigo-500/40 focus:border-indigo-500/50"
                    }
                  `}
                  style={{ pointerEvents: "auto" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                  style={{ pointerEvents: "auto" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-2
                bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                active:scale-[0.98] text-white font-semibold text-sm
                py-2.5 rounded-xl transition-all cursor-pointer
              "
              style={{ pointerEvents: "auto" }}
            >
              <ShieldCheck className="h-4 w-4" />
              Authenticate
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
