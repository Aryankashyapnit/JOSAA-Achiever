import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Upload, Database, Table2, LineChart,
  ListChecks, Building2, Info, CalendarDays, FileJson,
  CheckCircle2, XCircle, Loader2, Clock, RefreshCw, Download,
  GraduationCap, HardDrive, TrendingUp, Menu, X as XIcon,
  Zap, ArrowUpRight, BarChart3, ServerCrash,
} from "lucide-react";
import AdminCutoffsUpload from "@/pages/AdminCutoffsUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = "overview" | "upload" | "ingest";

interface UploadCard {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  icon: React.ElementType;
  color: string;
}

const CARDS: UploadCard[] = [
  { id: "cutoffs",   label: "Cutoffs",   description: "JEE cutoff ranks by college, branch, category & year", endpoint: "/api/admin/upload-cutoffs",   icon: Table2,       color: "indigo" },
  { id: "predictor", label: "Predictor", description: "Pre-computed predictor result datasets",                endpoint: "/api/admin/upload-predictor", icon: LineChart,    color: "violet" },
  { id: "simulator", label: "Simulator", description: "Counselling simulation reference data",                endpoint: "/api/admin/upload-simulator", icon: ListChecks,   color: "sky"    },
  { id: "colleges",  label: "Colleges",  description: "Institute details — name, type, state, NIRF rank",    endpoint: "/api/admin/upload-colleges",  icon: Building2,    color: "emerald"},
  { id: "about",     label: "About",     description: "Content for the About / Info page",                    endpoint: "/api/admin/upload-about",    icon: Info,         color: "amber"  },
  { id: "schedule",  label: "Schedule",  description: "JOSAA counselling round dates and schedule",          endpoint: "/api/admin/upload-schedule", icon: CalendarDays, color: "rose"   },
];

type UploadState = "idle" | "loading" | "success" | "error";

interface CardState {
  file: File | null;
  status: UploadState;
  message: string;
  details: string[];
}

interface DatasetStatus {
  exists: boolean;
  recordCount: number | null;
  lastModified: string | null;
}

type StoreStatus = Record<string, DatasetStatus>;

interface DbStats {
  colleges: number;
  cutoffs: number;
}

const INITIAL: CardState = { file: null, status: "idle", message: "", details: [] };

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string; badge: string }> = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  icon: "text-indigo-600",  badge: "bg-indigo-600"  },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  icon: "text-violet-600",  badge: "bg-violet-600"  },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     icon: "text-sky-600",     badge: "bg-sky-600"     },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-600", badge: "bg-emerald-600" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: "text-amber-600",   badge: "bg-amber-600"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    icon: "text-rose-600",    badge: "bg-rose-600"    },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ElementType; description: string }[] = [
  { id: "overview", label: "Overview",     icon: LayoutDashboard, description: "Stats & status"    },
  { id: "upload",   label: "Upload Files", icon: Upload,          description: "6 data stores"     },
  { id: "ingest",   label: "DB Ingest",    icon: Database,        description: "Write to Postgres" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, gradient }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <div className="bg-white/20 rounded-xl p-2">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
        {sub && <p className="text-white/60 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Overview View ────────────────────────────────────────────────────────────

function OverviewView({
  dbStats, storeStatus, statusLoading, onRefresh, onNavigate,
}: {
  dbStats: DbStats; storeStatus: StoreStatus; statusLoading: boolean;
  onRefresh: () => void; onNavigate: (v: AdminView) => void;
}) {
  const filesStored = Object.values(storeStatus).filter((s) => s.exists).length;
  const totalRecords = Object.values(storeStatus).reduce((a, s) => a + (s.recordCount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Colleges in DB"  value={dbStats.colleges} sub="from PostgreSQL"         icon={Building2}   gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard label="Cutoffs in DB"   value={dbStats.cutoffs}  sub="from PostgreSQL"         icon={BarChart3}   gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard label="Files Stored"    value={filesStored}      sub={`of ${CARDS.length} datasets`} icon={HardDrive}  gradient="bg-gradient-to-br from-sky-500 to-sky-700"    />
        <StatCard label="File Records"    value={totalRecords}     sub="across all datasets"     icon={TrendingUp}  gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate("ingest")}
          className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/30 active:scale-[0.99] transition-all group cursor-pointer text-left"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-indigo-100 rounded-xl p-3 group-hover:bg-indigo-200 transition-colors">
            <Zap className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">Smart DB Ingest</p>
            <p className="text-xs text-slate-500 mt-0.5">Upload JSON → write directly to Postgres</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate("upload")}
          className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50/30 active:scale-[0.99] transition-all group cursor-pointer text-left"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-violet-100 rounded-xl p-3 group-hover:bg-violet-200 transition-colors">
            <Upload className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">Upload File Stores</p>
            <p className="text-xs text-slate-500 mt-0.5">Persist JSON datasets to disk for all 6 stores</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors flex-shrink-0" />
        </button>
      </div>

      {/* Store status table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">File Store Status</h3>
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            <RefreshCw className={`h-3 w-3 ${statusLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {CARDS.map((card) => {
            const ds: DatasetStatus = storeStatus[card.id] ?? { exists: false, recordCount: null, lastModified: null };
            const Icon = card.icon;
            const c = colorMap[card.color];
            return (
              <div key={card.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`rounded-lg p-1.5 ${c.bg} flex-shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${c.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{card.label}</p>
                  <p className="text-xs text-slate-400 truncate">{card.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {statusLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />
                  ) : ds.exists ? (
                    <>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        {ds.recordCount !== null ? `${ds.recordCount.toLocaleString("en-IN")} records` : "Stored"}
                      </span>
                      {ds.lastModified && (
                        <span className="text-[11px] text-slate-400 hidden sm:block">
                          <Clock className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />
                          {timeAgo(ds.lastModified)}
                        </span>
                      )}
                      <a
                        href={`/api/admin/download/${card.id}`}
                        download
                        className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: "auto" }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">Empty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Upload View ──────────────────────────────────────────────────────────────

function UploadView({
  states, storeStatus, statusLoading, inputRefs, onFileChange, onUpload, onReset,
}: {
  states: Record<string, CardState>;
  storeStatus: StoreStatus;
  statusLoading: boolean;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onFileChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (card: UploadCard) => void;
  onReset: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Upload Data Files</h2>
        <p className="text-xs text-slate-500 mt-0.5">Files are saved to <code className="font-mono bg-slate-100 px-1 rounded">data_store/</code> and persist across restarts.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const state = states[card.id];
          const c = colorMap[card.color];
          const Icon = card.icon;
          const isLoading = state.status === "loading";
          const isSuccess = state.status === "success";
          const isError   = state.status === "error";
          const hasFile   = !!state.file;
          const ds: DatasetStatus = storeStatus[card.id] ?? { exists: false, recordCount: null, lastModified: null };

          return (
            <div key={card.id} className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ pointerEvents: "auto" }}>
              {/* Header */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className={`rounded-xl p-2.5 ${c.bg} ${c.border} border flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{card.description}</p>
                </div>
              </div>

              {/* Status pill */}
              <div className="mx-4 mb-3">
                {statusLoading ? (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    <span className="text-xs text-slate-400">Loading…</span>
                  </div>
                ) : ds.exists ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700">
                      {ds.recordCount !== null ? `${ds.recordCount.toLocaleString("en-IN")} records stored` : "Data stored"}
                    </span>
                    {ds.lastModified && (
                      <span className="text-[10px] text-emerald-500 ml-auto">{timeAgo(ds.lastModified)}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-slate-300 flex-shrink-0" />
                    <span className="text-xs text-slate-400">No data uploaded yet</span>
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
                {/* Drop zone */}
                <label
                  htmlFor={`file-${card.id}`}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-4 text-center cursor-pointer select-none transition-all active:scale-[0.98] ${
                    hasFile ? `${c.border} ${c.bg}` : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                  style={{ pointerEvents: "auto" }}
                >
                  {hasFile ? (
                    <>
                      <FileJson className={`h-5 w-5 ${c.icon}`} />
                      <span className={`text-xs font-medium ${c.text} truncate max-w-full px-2`}>{state.file!.name}</span>
                      <span className="text-[10px] text-slate-400">{(state.file!.size / 1024).toFixed(1)} KB · tap to change</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Select JSON file</span>
                      <span className="text-[10px] text-slate-400">Tap to browse</span>
                    </>
                  )}
                  <input
                    id={`file-${card.id}`}
                    type="file"
                    accept=".json,application/json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ pointerEvents: "auto" }}
                    ref={(el) => { inputRefs.current[card.id] = el; }}
                    onChange={(e) => onFileChange(card.id, e)}
                  />
                </label>

                {/* Feedback */}
                {isSuccess && (
                  <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{state.message}</span>
                  </div>
                )}
                {isError && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{state.message}</span>
                    </div>
                    {state.details.length > 0 && (
                      <ul className="pl-5 space-y-0.5 list-disc marker:text-red-400">
                        {state.details.map((d, i) => <li key={i} className="text-red-600 leading-relaxed">{d}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => onUpload(card)}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-xl py-2.5 px-3 ${c.badge} transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none`}
                    style={{ pointerEvents: "auto" }}
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isLoading ? "Uploading…" : "Upload"}
                  </button>
                  {ds.exists && (
                    <a
                      href={`/api/admin/download/${card.id}`}
                      download
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 active:scale-[0.97] cursor-pointer select-none transition-all"
                      style={{ pointerEvents: "auto" }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {(isSuccess || isError || hasFile) && (
                    <button
                      type="button"
                      onClick={() => onReset(card.id)}
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 active:scale-[0.97] cursor-pointer select-none transition-all"
                      style={{ pointerEvents: "auto" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminUpload() {
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [collapsed, setCollapsed] = useState(false);

  const [states, setStates] = useState<Record<string, CardState>>(
    Object.fromEntries(CARDS.map((c) => [c.id, { ...INITIAL }])),
  );
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({});
  const [statusLoading, setStatusLoading] = useState(true);
  const [dbStats, setDbStats] = useState<DbStats>({ colleges: 0, cutoffs: 0 });

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const [storeRes, statsRes] = await Promise.all([
        fetch("/api/admin/store-status"),
        fetch("/api/admin/db-stats"),
      ]);
      if (storeRes.ok) setStoreStatus(await storeRes.json());
      if (statsRes.ok) setDbStats(await statsRes.json());
    } catch { /* non-critical */ }
    finally { setStatusLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const update = (id: string, patch: Partial<CardState>) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    update(id, { file, status: "idle", message: "" });
  };

  const handleUpload = async (card: UploadCard) => {
    const { file } = states[card.id];
    if (!file) { update(card.id, { status: "error", message: "Please select a JSON file first." }); return; }
    update(card.id, { status: "loading", message: "" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(card.endpoint, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        update(card.id, { status: "error", message: data.error ?? `Upload failed (${res.status})`, details: Array.isArray(data.details) ? data.details : [] });
      } else {
        update(card.id, { status: "success", message: data.message ?? "Uploaded and saved.", details: [], file: null });
        if (inputRefs.current[card.id]) inputRefs.current[card.id]!.value = "";
        fetchStatus();
      }
    } catch {
      update(card.id, { status: "error", message: "Network error — please try again.", details: [] });
    }
  };

  const handleReset = (id: string) => {
    update(id, { ...INITIAL });
    if (inputRefs.current[id]) inputRefs.current[id]!.value = "";
  };

  const viewTitle = NAV_ITEMS.find((n) => n.id === activeView)?.label ?? "";

  return (
    <div className="flex rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white" style={{ minHeight: 600 }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-slate-900 transition-all duration-200 ${collapsed ? "w-14" : "w-56"}`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-3 py-4 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
          <div className="bg-indigo-500 rounded-xl p-1.5 flex-shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Admin Panel</p>
              <p className="text-slate-500 text-[10px]">College Achiever</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-all cursor-pointer select-none
                  ${active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                style={{ pointerEvents: "auto" }}
                title={collapsed ? label : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : ""}`} />
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{label}</p>
                    <p className={`text-[10px] truncate ${active ? "text-indigo-200" : "text-slate-600"}`}>{description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle + badge */}
        <div className={`px-2 pb-4 space-y-2 border-t border-white/10 pt-3`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] text-slate-500 truncate">Admin session active</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer select-none text-xs ${collapsed ? "justify-center" : ""}`}
            style={{ pointerEvents: "auto" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <><XIcon className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50 overflow-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-900">{viewTitle}</h1>
            <p className="text-xs text-slate-400">
              {activeView === "overview" && `${dbStats.colleges.toLocaleString("en-IN")} colleges · ${dbStats.cutoffs.toLocaleString("en-IN")} cutoffs in DB`}
              {activeView === "upload"   && "Upload JSON files to file store"}
              {activeView === "ingest"   && "Batch-insert cutoffs directly into PostgreSQL"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStatus}
              className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-all select-none"
              style={{ pointerEvents: "auto" }}
            >
              <RefreshCw className={`h-3 w-3 ${statusLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Admin
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeView === "overview" && (
            <OverviewView
              dbStats={dbStats}
              storeStatus={storeStatus}
              statusLoading={statusLoading}
              onRefresh={fetchStatus}
              onNavigate={setActiveView}
            />
          )}
          {activeView === "upload" && (
            <UploadView
              states={states}
              storeStatus={storeStatus}
              statusLoading={statusLoading}
              inputRefs={inputRefs}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onReset={handleReset}
            />
          )}
          {activeView === "ingest" && (
            <div className="p-6">
              <AdminCutoffsUpload />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
