import { useState } from "react";
import { useListCutoffs, useGetCutoffTrends, useListColleges, getGetCutoffTrendsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, LineChart as LineChartIcon, RotateCcw, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const TYPE_PILLS = [
  { label: "All", value: "" },
  { label: "IIT", value: "IIT" },
  { label: "NIT", value: "NIT" },
  { label: "IIIT", value: "IIIT" },
  { label: "GFTI", value: "GFTI" },
];

const CATEGORY_OPTIONS = ["OPEN", "OBC-NCL", "SC", "ST", "EWS"];
const YEARS = [2024, 2023, 2022];
const ROUNDS = [1, 2, 3, 4, 5, 6];

export default function Cutoffs() {
  const [activeType, setActiveType] = useState("");
  const [filters, setFilters] = useState({
    collegeId: undefined as number | undefined,
    category: "OPEN",
    gender: "Gender-Neutral",
    year: 2024,
    round: 6,
    page: 1,
    limit: 50,
  });
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const { data: collegesData } = useListColleges({ limit: 200 });

  const visibleColleges = activeType
    ? (collegesData?.colleges ?? []).filter((c) => c.type === activeType)
    : (collegesData?.colleges ?? []);

  const activeCollegeIds = new Set(visibleColleges.map((c) => c.id));

  const { data: cutoffsData, isLoading } = useListCutoffs({
    ...filters,
    limit: 100,
  });

  const displayedCutoffs = (cutoffsData?.cutoffs ?? []).filter(
    (c) => !activeType || activeCollegeIds.has(c.collegeId),
  );

  const { data: trendsData, isLoading: trendsLoading } = useGetCutoffTrends(
    {
      collegeId: selectedRow?.collegeId || 0,
      branch: selectedRow?.branch || "",
      category: selectedRow?.category || "",
      gender: selectedRow?.gender || "",
    },
    {
      query: {
        enabled: !!selectedRow,
        queryKey: selectedRow
          ? getGetCutoffTrendsQueryKey({
              collegeId: selectedRow.collegeId,
              branch: selectedRow.branch,
              category: selectedRow.category,
              gender: selectedRow.gender,
            })
          : ["trends-empty"],
      },
    },
  );

  const reset = () => {
    setActiveType("");
    setFilters({ collegeId: undefined, category: "OPEN", gender: "Gender-Neutral", year: 2024, round: 6, page: 1, limit: 50 });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Cutoff Database</h1>
        <p className="text-slate-500 text-sm mt-1">Historical JOSAA opening and closing ranks across all rounds and categories.</p>
      </div>

      {/* ── Type Filter Pills (horizontal scroll) ── */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1" data-testid="type-filter-pills">
          {TYPE_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => {
                setActiveType(pill.value);
                setFilters((f) => ({ ...f, collegeId: undefined, page: 1 }));
              }}
              data-testid={`pill-${pill.label.toLowerCase()}`}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeType === pill.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {pill.label}
            </button>
          ))}

          {/* Active type indicator badge */}
          {activeType && (
            <span className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
              {displayedCutoffs.length} results
            </span>
          )}
        </div>
      </div>

      {/* ── Secondary Filters ── */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* College */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">College</label>
              <Select
                value={filters.collegeId?.toString() ?? "ALL"}
                onValueChange={(val) =>
                  setFilters((f) => ({ ...f, collegeId: val === "ALL" ? undefined : parseInt(val), page: 1 }))
                }
              >
                <SelectTrigger className="bg-white border-slate-200 text-sm" data-testid="select-college">
                  <SelectValue placeholder="All Colleges" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">All Colleges</SelectItem>
                  {visibleColleges.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.shortName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</label>
              <Select
                value={filters.category}
                onValueChange={(val) => setFilters((f) => ({ ...f, category: val, page: 1 }))}
              >
                <SelectTrigger className="bg-white border-slate-200 text-sm" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</label>
              <Select
                value={filters.gender}
                onValueChange={(val) => setFilters((f) => ({ ...f, gender: val, page: 1 }))}
              >
                <SelectTrigger className="bg-white border-slate-200 text-sm" data-testid="select-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gender-Neutral">Gender-Neutral</SelectItem>
                  <SelectItem value="Female-only">Female-Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Year</label>
              <Select
                value={filters.year.toString()}
                onValueChange={(val) => setFilters((f) => ({ ...f, year: parseInt(val), page: 1 }))}
              >
                <SelectTrigger className="bg-white border-slate-200 text-sm" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Round */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Round</label>
              <Select
                value={filters.round.toString()}
                onValueChange={(val) => setFilters((f) => ({ ...f, round: parseInt(val), page: 1 }))}
              >
                <SelectTrigger className="bg-white border-slate-200 text-sm" data-testid="select-round">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUNDS.map((r) => (
                    <SelectItem key={r} value={r.toString()}>Round {r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-slate-500 hover:text-slate-900 gap-1.5 self-end"
              data-testid="button-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Results ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading cutoff data...</p>
        </div>
      ) : displayedCutoffs.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-16 text-center">
            <TrendingDown className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No records found</p>
            <p className="text-slate-400 text-sm mt-1">Try changing the filters or resetting to defaults.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium">{displayedCutoffs.length} records</p>
          {/* Mobile Cards + Desktop Table hybrid */}
          <div className="hidden md:block rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">College</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Branch</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Opening</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Closing</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedCutoffs.map((cutoff) => (
                  <tr key={cutoff.id} className="hover:bg-slate-50/70 transition-colors" data-testid={`cutoff-row-${cutoff.id}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{cutoff.collegeName}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={cutoff.branch}>{cutoff.branch}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {cutoff.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">{cutoff.openingRank.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">{cutoff.closingRank.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedRow(cutoff)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View trend"
                        data-testid={`trend-btn-${cutoff.id}`}
                      >
                        <LineChartIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2.5">
            {displayedCutoffs.map((cutoff) => (
              <div
                key={cutoff.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
                data-testid={`cutoff-card-${cutoff.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{cutoff.collegeName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{cutoff.branch}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRow(cutoff)}
                    className="flex-shrink-0 p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    data-testid={`trend-btn-mobile-${cutoff.id}`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{cutoff.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Opening</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{cutoff.openingRank.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Closing</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{cutoff.closingRank.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {cutoffsData && cutoffsData.total > filters.limit && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Page {filters.page} of {Math.ceil(cutoffsData.total / filters.limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page * filters.limit >= cutoffsData.total}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Trend Dialog ── */}
      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Historical Closing Rank Trend</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedRow?.collegeName} · {selectedRow?.branch} · {selectedRow?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="h-64 mt-2">
            {trendsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : trendsData && trendsData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...trendsData].sort((a, b) => a.year - b.year)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis reversed axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(v: any) => [v.toLocaleString("en-IN"), "Closing Rank"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="closingRank"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
                    name="Closing Rank"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center px-8">
                <div>
                  <LineChartIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Not enough historical data for a trend chart.</p>
                  <p className="text-slate-300 text-xs mt-1">Need at least 2 years of data.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
