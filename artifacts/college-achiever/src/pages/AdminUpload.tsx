import { useRef, useState, useEffect, useCallback } from "react";
import {
  Upload, CheckCircle2, XCircle, FileJson, Loader2,
  Table2, LineChart, ListChecks, Building2, Info, CalendarDays,
  Database, Clock, RefreshCw,
} from "lucide-react";

interface UploadCard {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  icon: React.ElementType;
  color: string;
}

const CARDS: UploadCard[] = [
  {
    id: "cutoffs",
    label: "Cutoffs",
    description: "JEE cutoff ranks by college, branch, category and year",
    endpoint: "/api/admin/upload-cutoffs",
    icon: Table2,
    color: "indigo",
  },
  {
    id: "predictor",
    label: "Predictor",
    description: "Pre-computed predictor result sets",
    endpoint: "/api/admin/upload-predictor",
    icon: LineChart,
    color: "violet",
  },
  {
    id: "simulator",
    label: "Simulator",
    description: "Counselling simulation reference data",
    endpoint: "/api/admin/upload-simulator",
    icon: ListChecks,
    color: "sky",
  },
  {
    id: "colleges",
    label: "Colleges",
    description: "Institute details — name, type, state, NIRF rank",
    endpoint: "/api/admin/upload-colleges",
    icon: Building2,
    color: "emerald",
  },
  {
    id: "about",
    label: "About",
    description: "Content for the About / Info page",
    endpoint: "/api/admin/upload-about",
    icon: Info,
    color: "amber",
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "JOSAA counselling round dates and schedule",
    endpoint: "/api/admin/upload-schedule",
    icon: CalendarDays,
    color: "rose",
  },
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

const INITIAL: CardState = { file: null, status: "idle", message: "", details: [] };

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string; badge: string; pill: string }> = {
  indigo: {
    bg: "bg-indigo-50 hover:bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: "text-indigo-600",
    badge: "bg-indigo-600",
    pill: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  violet: {
    bg: "bg-violet-50 hover:bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: "text-violet-600",
    badge: "bg-violet-600",
    pill: "bg-violet-50 text-violet-600 border-violet-200",
  },
  sky: {
    bg: "bg-sky-50 hover:bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    icon: "text-sky-600",
    badge: "bg-sky-600",
    pill: "bg-sky-50 text-sky-600 border-sky-200",
  },
  emerald: {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    badge: "bg-emerald-600",
    pill: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  amber: {
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-600",
    badge: "bg-amber-600",
    pill: "bg-amber-50 text-amber-600 border-amber-200",
  },
  rose: {
    bg: "bg-rose-50 hover:bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "text-rose-600",
    badge: "bg-rose-600",
    pill: "bg-rose-50 text-rose-600 border-rose-200",
  },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminUpload() {
  const [states, setStates] = useState<Record<string, CardState>>(
    Object.fromEntries(CARDS.map((c) => [c.id, { ...INITIAL }])),
  );
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({});
  const [statusLoading, setStatusLoading] = useState(true);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/store-status");
      if (res.ok) {
        const data = await res.json();
        setStoreStatus(data);
      }
    } catch {
      /* silent — status is non-critical */
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const update = (id: string, patch: Partial<CardState>) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    update(id, { file, status: "idle", message: "" });
  };

  const handleUpload = async (card: UploadCard) => {
    const { file } = states[card.id];
    if (!file) {
      update(card.id, { status: "error", message: "Please select a JSON file first." });
      return;
    }
    update(card.id, { status: "loading", message: "" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(card.endpoint, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        update(card.id, {
          status: "error",
          message: data.error ?? `Upload failed (${res.status})`,
          details: Array.isArray(data.details) ? data.details : [],
        });
      } else {
        update(card.id, {
          status: "success",
          message: data.message ?? "Uploaded and saved to disk.",
          details: [],
          file: null,
        });
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin — Data Upload</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload JSON files to persist data across server restarts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setStatusLoading(true); fetchStatus(); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97] transition-all cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            <RefreshCw className={`h-3 w-3 ${statusLoading ? "animate-spin" : ""}`} />
            Refresh status
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Admin access
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const state = states[card.id];
          const c = colorMap[card.color];
          const Icon = card.icon;
          const isLoading = state.status === "loading";
          const isSuccess = state.status === "success";
          const isError = state.status === "error";
          const hasFile = !!state.file;
          const ds: DatasetStatus = storeStatus[card.id] ?? { exists: false, recordCount: null, lastModified: null };

          return (
            <div
              key={card.id}
              className="relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              style={{ pointerEvents: "auto", zIndex: 1 }}
            >
              {/* Card top strip */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className={`rounded-xl p-2.5 ${c.bg} ${c.border} border flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{card.description}</p>
                </div>
              </div>

              {/* Status bar */}
              <div className={`mx-4 mb-3 rounded-xl border px-3 py-2 flex items-center gap-2 ${
                ds.exists
                  ? `${c.pill} border-current/20`
                  : "bg-slate-50 border-slate-200"
              }`}>
                {statusLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400 flex-shrink-0" />
                ) : ds.exists ? (
                  <>
                    <Database className="h-3 w-3 flex-shrink-0 opacity-70" />
                    <span className="text-[11px] font-semibold">
                      {ds.recordCount !== null
                        ? `${ds.recordCount.toLocaleString("en-IN")} records`
                        : "Data stored"}
                    </span>
                    {ds.lastModified && (
                      <>
                        <span className="opacity-30 text-[10px]">·</span>
                        <Clock className="h-2.5 w-2.5 flex-shrink-0 opacity-60" />
                        <span className="text-[10px] opacity-70 ml-[-2px]">{timeAgo(ds.lastModified)}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-slate-300 flex-shrink-0" />
                    <span className="text-[11px] text-slate-400 font-medium">No data uploaded yet</span>
                  </>
                )}
              </div>

              <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
                {/* File drop zone / picker */}
                <label
                  htmlFor={`file-${card.id}`}
                  className={`
                    relative flex flex-col items-center justify-center gap-2
                    rounded-xl border-2 border-dashed px-3 py-4 text-center
                    cursor-pointer select-none transition-all
                    ${hasFile
                      ? `${c.border} ${c.bg}`
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                    }
                    active:scale-[0.98]
                  `}
                  style={{ pointerEvents: "auto" }}
                >
                  {hasFile ? (
                    <>
                      <FileJson className={`h-5 w-5 ${c.icon}`} />
                      <span className={`text-xs font-medium ${c.text} truncate max-w-full px-2`}>
                        {state.file!.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(state.file!.size / 1024).toFixed(1)} KB · tap to change
                      </span>
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
                    onChange={(e) => handleFileChange(card.id, e)}
                  />
                </label>

                {/* Status feedback */}
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
                        {state.details.map((d, i) => (
                          <li key={i} className="text-red-600 leading-relaxed">{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleUpload(card)}
                    disabled={isLoading}
                    className={`
                      flex-1 flex items-center justify-center gap-1.5
                      text-xs font-semibold text-white rounded-xl py-2.5 px-3
                      ${c.badge} transition-all
                      hover:opacity-90 active:scale-[0.97] active:opacity-80
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                      cursor-pointer select-none
                    `}
                    style={{ pointerEvents: "auto" }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {isLoading ? "Uploading…" : "Upload"}
                  </button>

                  {(isSuccess || isError || hasFile) && (
                    <button
                      type="button"
                      onClick={() => handleReset(card.id)}
                      className="
                        flex items-center justify-center px-3 py-2.5
                        rounded-xl border border-slate-200 bg-white text-slate-500
                        text-xs font-medium
                        hover:bg-slate-50 hover:border-slate-300
                        active:scale-[0.97] active:bg-slate-100
                        cursor-pointer select-none transition-all
                      "
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

      {/* Info note */}
      <p className="text-xs text-slate-400 text-center pb-4">
        Uploaded files are saved to <code className="font-mono bg-slate-100 px-1 rounded">data_store/</code> on the server
        and persist across restarts. Uploading a new file replaces the previous one.
      </p>
    </div>
  );
}
