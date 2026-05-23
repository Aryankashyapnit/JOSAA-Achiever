import { useCallback, useRef, useState } from "react";
import {
  Upload, FileJson, Loader2, CheckCircle2, XCircle,
  Database, AlertTriangle, ChevronRight, RotateCcw, Table2,
} from "lucide-react";

interface CutoffRow {
  collegeName: string;
  branchName: string;
  openingRank: number | string;
  closingRank: number | string;
  year?: number | string;
  round: number | string;
  quota?: string;
  category: string;
  gender: string;
  [key: string]: unknown;
}

interface BatchResult {
  inserted: number;
  skipped: number;
  newColleges: string[];
}

interface IngestResult {
  totalRows: number;
  inserted: number;
  skipped: number;
  newColleges: string[];
  errors: string[];
}

const BATCH_SIZE = 100;

function validateRow(row: unknown, idx: number): string | null {
  if (typeof row !== "object" || row === null) return `Row ${idx}: not an object`;
  const r = row as Record<string, unknown>;
  if (!r.collegeName && !r.college && !r.instituteName) return `Row ${idx}: missing collegeName`;
  if (!r.branchName && !r.branch && !r.programName) return `Row ${idx}: missing branchName`;
  if (r.openingRank === undefined && r.openRank === undefined) return `Row ${idx}: missing openingRank`;
  if (r.closingRank === undefined && r.closeRank === undefined) return `Row ${idx}: missing closingRank`;
  if (!r.category && !r.quota) return `Row ${idx}: missing category`;
  if (!r.gender) return `Row ${idx}: missing gender`;
  return null;
}

function normalizeRow(r: Record<string, unknown>): CutoffRow {
  return {
    collegeName: String(r.collegeName ?? r.college ?? r.instituteName ?? ""),
    branchName: String(r.branchName ?? r.branch ?? r.programName ?? ""),
    openingRank: Number(r.openingRank ?? r.openRank ?? 0),
    closingRank: Number(r.closingRank ?? r.closeRank ?? 0),
    year: Number(r.year ?? 2024),
    round: Number(r.round ?? 1),
    quota: String(r.quota ?? ""),
    category: String(r.category ?? r.quota ?? "OPEN"),
    gender: String(r.gender ?? "Gender-Neutral"),
  };
}

export default function AdminCutoffsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CutoffRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "ingesting" | "done" | "error">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, batch: 0, totalBatches: 0 });
  const [result, setResult] = useState<IngestResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((f: File) => {
    setFile(f);
    setParseError("");
    setRows([]);
    setPhase("idle");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const arr: unknown[] = Array.isArray(json) ? json : (json.data ?? json.rows ?? Object.values(json));
        if (!Array.isArray(arr) || arr.length === 0) {
          setParseError("JSON must contain a non-empty array of records.");
          return;
        }
        const sampleErrors: string[] = [];
        for (let i = 0; i < Math.min(3, arr.length); i++) {
          const err = validateRow(arr[i], i);
          if (err) sampleErrors.push(err);
        }
        if (sampleErrors.length > 0) {
          setParseError(`Schema issues in first few rows:\n${sampleErrors.join("\n")}`);
          return;
        }
        setRows(arr.map((r, i) => normalizeRow(r as Record<string, unknown>)));
      } catch {
        setParseError("Failed to parse JSON. Make sure the file is valid JSON.");
      }
    };
    reader.readAsText(f);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) parseFile(f);
  };

  const reset = () => {
    setFile(null);
    setRows([]);
    setParseError("");
    setPhase("idle");
    setResult(null);
    setProgress({ done: 0, total: 0, batch: 0, totalBatches: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const ingest = async () => {
    if (rows.length === 0) return;
    setPhase("ingesting");

    const batches: CutoffRow[][] = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    setProgress({ done: 0, total: rows.length, batch: 0, totalBatches: batches.length });

    const aggregate: IngestResult = { totalRows: rows.length, inserted: 0, skipped: 0, newColleges: [], errors: [] };
    const newCollegesSet = new Set<string>();

    try {
      for (let b = 0; b < batches.length; b++) {
        const res = await fetch("/api/admin/ingest-cutoffs-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batches[b] }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          aggregate.errors.push(`Batch ${b + 1}: ${err.error ?? "Unknown error"}`);
          setProgress((p) => ({ ...p, batch: b + 1, done: p.done + batches[b].length }));
          continue;
        }

        const data: BatchResult = await res.json();
        aggregate.inserted += data.inserted;
        aggregate.skipped += data.skipped;
        data.newColleges?.forEach((c) => newCollegesSet.add(c));
        setProgress({ done: (b + 1) * BATCH_SIZE, total: rows.length, batch: b + 1, totalBatches: batches.length });
      }

      aggregate.newColleges = Array.from(newCollegesSet);
      setResult(aggregate);
      setPhase(aggregate.errors.length > 0 ? "error" : "done");
    } catch (err) {
      aggregate.errors.push("Network error — check the API server and try again.");
      setResult(aggregate);
      setPhase("error");
    }
  };

  const pct = progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-100 rounded-lg p-1.5">
              <Table2 className="h-4 w-4 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Smart Cutoffs Ingest</h1>
          </div>
          <p className="text-sm text-slate-500">
            Upload <code className="font-mono bg-slate-100 px-1 rounded text-xs">josaa_cleaned_cutoffs.json</code> — colleges are auto-created and mapped to the database.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 w-fit">
          <Database className="h-3 w-3" />
          Writes to DB
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-2xl border-2 border-dashed px-8 py-10 text-center
          cursor-pointer transition-all select-none
          ${isDragging
            ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
            : file && !parseError
              ? "border-emerald-300 bg-emerald-50"
              : parseError
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
          }
        `}
        style={{ pointerEvents: "auto" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={onFileChange}
          style={{ pointerEvents: "auto" }}
        />

        {parseError ? (
          <>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-700 text-sm">Schema error — tap to pick a different file</p>
              <pre className="text-xs text-red-500 mt-1 whitespace-pre-wrap max-w-sm">{parseError}</pre>
            </div>
          </>
        ) : file && rows.length > 0 ? (
          <>
            <div className="bg-emerald-100 rounded-full p-3">
              <FileJson className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">{file.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="font-semibold text-emerald-600">{rows.length.toLocaleString("en-IN")}</span> records parsed
                · {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-slate-400">Tap to change file</p>
          </>
        ) : (
          <>
            <div className="bg-slate-100 rounded-full p-3">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-base">Drop your JSON file here</p>
              <p className="text-sm text-slate-400 mt-0.5">or click to browse · .json files only</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span className="bg-slate-100 rounded px-2 py-0.5 font-mono">collegeName</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-slate-100 rounded px-2 py-0.5 font-mono">branchName</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-slate-100 rounded px-2 py-0.5 font-mono">openingRank</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-slate-100 rounded px-2 py-0.5 font-mono">closingRank</span>
            </div>
          </>
        )}
      </div>

      {/* Progress section */}
      {phase === "ingesting" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Processing batch {progress.batch} of {progress.totalBatches}…
            </div>
            <span className="text-slate-500 tabular-nums">
              {Math.min(progress.done, progress.total).toLocaleString("en-IN")} / {progress.total.toLocaleString("en-IN")} rows
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center">{pct}% complete · Do not close this page</p>
        </div>
      )}

      {/* Result section */}
      {result && phase !== "ingesting" && (
        <div className={`border rounded-2xl p-5 space-y-4 ${phase === "done" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-2">
            {phase === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            )}
            <p className={`font-semibold text-sm ${phase === "done" ? "text-emerald-800" : "text-amber-800"}`}>
              {phase === "done" ? "Ingest complete" : "Ingest completed with some errors"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Inserted", value: result.inserted, color: "text-emerald-700" },
              { label: "Skipped", value: result.skipped, color: "text-slate-600" },
              { label: "New Colleges", value: result.newColleges.length, color: "text-indigo-700" },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 rounded-xl px-4 py-3 text-center border border-white">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString("en-IN")}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {result.newColleges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1.5">Auto-created colleges:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.newColleges.slice(0, 10).map((c) => (
                  <span key={c} className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5">{c}</span>
                ))}
                {result.newColleges.length > 10 && (
                  <span className="text-xs text-slate-400">+{result.newColleges.length - 10} more</span>
                )}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
              <ul className="space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-600">• {e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {phase !== "ingesting" && (
          <>
            <button
              type="button"
              onClick={ingest}
              disabled={rows.length === 0 || !!parseError}
              className="
                flex-1 flex items-center justify-center gap-2
                bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                text-white font-semibold text-sm rounded-xl py-3
                active:scale-[0.98] transition-all cursor-pointer select-none
              "
              style={{ pointerEvents: "auto" }}
            >
              <Database className="h-4 w-4" />
              {rows.length > 0 ? `Process & Upload ${rows.length.toLocaleString("en-IN")} rows` : "Process & Upload"}
            </button>

            {(file || result) && (
              <button
                type="button"
                onClick={reset}
                className="
                  flex items-center justify-center gap-1.5 px-4 py-3
                  rounded-xl border border-slate-200 bg-white text-slate-500
                  text-sm font-medium hover:bg-slate-50 hover:border-slate-300
                  active:scale-[0.97] transition-all cursor-pointer select-none
                "
                style={{ pointerEvents: "auto" }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </>
        )}
      </div>

      {/* Schema hint */}
      {!file && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Expected JSON format</p>
          <pre className="text-[11px] text-slate-500 leading-relaxed overflow-x-auto">{`[
  {
    "collegeName": "Indian Institute of Technology Bombay",
    "branchName": "Computer Science and Engineering",
    "openingRank": 1,
    "closingRank": 67,
    "year": 2024,
    "round": 6,
    "category": "OPEN",
    "gender": "Gender-Neutral"
  },
  ...
]`}</pre>
          <p className="text-[10px] text-slate-400 mt-2">
            Also accepts: <code className="font-mono">quota</code> → category, <code className="font-mono">programName</code> → branchName, <code className="font-mono">instituteName</code> → collegeName
          </p>
        </div>
      )}
    </div>
  );
}
