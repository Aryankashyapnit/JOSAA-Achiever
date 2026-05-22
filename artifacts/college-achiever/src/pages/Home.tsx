import { useAuth } from "@/context/AuthContext";
import { useGetDashboardStats, useGetTopColleges, useListCounsellingRounds } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BookOpen, GraduationCap, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AdminGate from "@/components/AdminGate";

const TICKER_ITEMS = [
  "Latest JOSAA Updates: Round-wise data updated for 2024 session",
  "IIT Madras retains NIRF Rank #1 for the 6th consecutive year",
  "JOSAA 2025 registration opens June 2025 — prepare your documents",
  "New AI-based seat allotment system to be piloted this year",
  "Over 1.2 lakh candidates registered for JOSAA 2024 counselling",
  "Spot round allotments released — check your allotment letter now",
  "Female-only quota seats increased across all NITs for 2025",
];

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topColleges, isLoading: topCollegesLoading } = useGetTopColleges({ limit: 6 });
  const { data: rounds, isLoading: roundsLoading } = useListCounsellingRounds();

  const upcomingRounds = rounds?.filter((r) => r.status !== "completed").slice(0, 4) ?? [];
  const completedCount = rounds?.filter((r) => r.status === "completed").length ?? 0;

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Notification Ticker */}
      <div className="bg-indigo-600 text-white overflow-hidden rounded-xl mb-6" data-testid="ticker-banner">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-800 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 rounded-l-xl">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live</span>
          </div>
          <div className="overflow-hidden flex-1 py-2.5">
            <div className="ticker-track whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-block text-sm px-8">
                  {item}
                  <span className="ml-8 text-indigo-300">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 mb-8 border border-indigo-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.18)_0%,_transparent_60%)]" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/25 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-indigo-200 text-xs font-medium tracking-wide">JOSAA 2024 Data Available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Welcome back, <span className="text-indigo-300">{user?.name?.split(" ")[0]}</span>.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
            Enter your JEE Rank and discover your best colleges instantly. Powered by real JOSAA cutoff data across all rounds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg shadow-indigo-900/40 gap-2 group"
              onClick={() => navigate("/predictor")}
              data-testid="button-predict-now"
            >
              Predict Your College Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate("/cutoffs")}
              data-testid="button-view-cutoffs"
            >
              View Cutoff Data
            </Button>
          </div>
        </div>

        {/* Decorative stat pills */}
        <div className="absolute bottom-6 right-6 hidden lg:flex flex-col gap-2">
          {[
            { label: "Colleges", value: stats?.totalColleges ?? "—" },
            { label: "IITs", value: stats?.iitCount ?? "—" },
            { label: "NITs", value: stats?.nitCount ?? "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg px-4 py-2 text-right">
              <div className="text-white font-bold text-lg leading-none">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Colleges" value={stats?.totalColleges} icon={Building2} loading={statsLoading} color="indigo" />
        <StatCard title="IITs + NITs" value={stats ? stats.iitCount + stats.nitCount : undefined} icon={GraduationCap} loading={statsLoading} color="violet" />
        <StatCard title="Branches Covered" value={stats?.totalBranches} icon={BookOpen} loading={statsLoading} color="sky" />
        <StatCard title="Cutoff Records" value={stats?.totalCutoffRecords} icon={TrendingUp} loading={statsLoading} color="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mb-8">
        {/* Counselling Timeline */}
        <Card className="lg:col-span-4 border-slate-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Counselling Timeline</CardTitle>
                <CardDescription>JOSAA round schedule and important dates</CardDescription>
              </div>
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                {completedCount} completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {roundsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRounds.map((round) => (
                  <div
                    key={round.id}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${
                      round.status === "active"
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-slate-50/60 border-slate-100"
                    }`}
                    data-testid={`round-card-${round.id}`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm flex-shrink-0 ${
                        round.status === "active"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-white border-2 border-slate-200 text-slate-600"
                      }`}
                    >
                      {round.roundNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">Round {round.roundNumber} — {round.year}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(round.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {" – "}
                        {new Date(round.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                        round.status === "active"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {round.status === "active" ? "Active" : "Upcoming"}
                    </span>
                  </div>
                ))}
                {upcomingRounds.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">All rounds completed for this year.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Colleges */}
        <Card className="lg:col-span-3 border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Ranked Colleges</CardTitle>
            <CardDescription>NIRF ranked institutions in India</CardDescription>
          </CardHeader>
          <CardContent>
            {topCollegesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {topColleges?.map((college, idx) => (
                  <Link
                    href={`/colleges`}
                    key={college.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group transition-colors"
                    data-testid={`top-college-${college.id}`}
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-600 font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {college.shortName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{college.city}, {college.state}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                        {college.type}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "College Predictor",
            desc: "Get personalized predictions based on your JEE rank, category, and preferences.",
            href: "/predictor",
            color: "from-indigo-500 to-violet-600",
            testId: "feature-predictor",
          },
          {
            title: "Cutoff Database",
            desc: "Explore historical cutoff data across all colleges, branches, and categories.",
            href: "/cutoffs",
            color: "from-sky-500 to-blue-600",
            testId: "feature-cutoffs",
          },
          {
            title: "Mock Counselling",
            desc: "Simulate the JOSAA counselling process and see your likely allotment.",
            href: "/simulator",
            color: "from-emerald-500 to-teal-600",
            testId: "feature-simulator",
          },
        ].map((f) => (
          <Link href={f.href} key={f.href}>
            <div
              className={`relative rounded-xl p-5 bg-gradient-to-br ${f.color} text-white overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:-translate-y-0.5`}
              data-testid={f.testId}
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-bold text-base mb-1">{f.title}</h3>
              <p className="text-white/75 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-white/90 text-xs font-medium">
                Get started <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hidden admin gate — triggered by typing "openadmin" on keyboard */}
      <AdminGate />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color,
}: {
  title: string;
  value?: number;
  icon: any;
  loading: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Card className="border-slate-100 hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold text-slate-900">{value?.toLocaleString("en-IN") ?? "0"}</div>
        )}
      </CardContent>
    </Card>
  );
}
