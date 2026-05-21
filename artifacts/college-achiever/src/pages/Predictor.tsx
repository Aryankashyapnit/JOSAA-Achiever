import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetPredictorResults, getGetPredictorResultsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, ShieldCheck, TrendingUp, MapPin, BookOpen, Award, Briefcase, ChevronRight } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

const BRANCHES = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Data Science and Artificial Intelligence",
  "Artificial Intelligence",
  "Information Technology",
  "Biotechnology",
  "Production Engineering",
  "Metallurgical Engineering",
  "Mining Engineering",
  "Architecture",
];

// Mock enrichment data: average package by college type and branch
const AVG_PACKAGE_MAP: Record<string, Record<string, string>> = {
  IIT: {
    "Computer Science and Engineering": "₹28–62 LPA",
    "Data Science and Artificial Intelligence": "₹26–55 LPA",
    "Artificial Intelligence": "₹24–50 LPA",
    "Electrical Engineering": "₹18–40 LPA",
    "Electronics and Communication Engineering": "₹16–38 LPA",
    "Mechanical Engineering": "₹12–25 LPA",
    "Chemical Engineering": "₹10–22 LPA",
    "Civil Engineering": "₹8–18 LPA",
    "Aerospace Engineering": "₹12–28 LPA",
    default: "₹12–30 LPA",
  },
  NIT: {
    "Computer Science and Engineering": "₹14–35 LPA",
    "Electronics and Communication Engineering": "₹10–24 LPA",
    "Electrical Engineering": "₹8–20 LPA",
    "Mechanical Engineering": "₹7–16 LPA",
    "Civil Engineering": "₹6–12 LPA",
    default: "₹8–20 LPA",
  },
  IIIT: {
    "Computer Science and Engineering": "₹16–42 LPA",
    "Information Technology": "₹14–36 LPA",
    "Electronics and Communication Engineering": "₹10–22 LPA",
    default: "₹12–28 LPA",
  },
  GFTI: {
    "Computer Science and Engineering": "₹8–20 LPA",
    "Electronics and Communication Engineering": "₹7–16 LPA",
    default: "₹6–14 LPA",
  },
};

function getAvgPackage(type: string, branch: string): string {
  const typeMap = AVG_PACKAGE_MAP[type] ?? AVG_PACKAGE_MAP.GFTI;
  return typeMap[branch] ?? typeMap.default ?? "₹8–20 LPA";
}

// Fallback mock data shown when API returns no results
const MOCK_RESULTS = {
  safe: [
    {
      college: { id: 9, name: "National Institute of Technology Trichy", shortName: "NIT Trichy", type: "NIT", state: "Tamil Nadu", city: "Tiruchirappalli", nirf: 10, established: 1964, totalSeats: 1800, website: null },
      branch: "Computer Science and Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 5500,
      likelihood: "safe",
      rankDifference: 500,
    },
    {
      college: { id: 10, name: "National Institute of Technology Karnataka", shortName: "NIT Surathkal", type: "NIT", state: "Karnataka", city: "Surathkal", nirf: 15, established: 1960, totalSeats: 1600, website: null },
      branch: "Computer Science and Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 7000,
      likelihood: "safe",
      rankDifference: 2000,
    },
  ],
  moderate: [
    {
      college: { id: 2, name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", type: "IIT", state: "Delhi", city: "New Delhi", nirf: 2, established: 1961, totalSeats: 850, website: null },
      branch: "Civil Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 2800,
      likelihood: "moderate",
      rankDifference: -2200,
    },
    {
      college: { id: 11, name: "National Institute of Technology Warangal", shortName: "NIT Warangal", type: "NIT", state: "Telangana", city: "Warangal", nirf: 17, established: 1959, totalSeats: 1600, website: null },
      branch: "Electronics and Communication Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 14000,
      likelihood: "moderate",
      rankDifference: -1000,
    },
  ],
  ambitious: [
    {
      college: { id: 1, name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", type: "IIT", state: "Maharashtra", city: "Mumbai", nirf: 3, established: 1958, totalSeats: 1000, website: null },
      branch: "Computer Science and Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 67,
      likelihood: "ambitious",
      rankDifference: -4933,
    },
    {
      college: { id: 3, name: "Indian Institute of Technology Madras", shortName: "IIT Madras", type: "IIT", state: "Tamil Nadu", city: "Chennai", nirf: 1, established: 1959, totalSeats: 900, website: null },
      branch: "Computer Science and Engineering",
      category: "OPEN",
      gender: "Gender-Neutral",
      closingRank: 98,
      likelihood: "ambitious",
      rankDifference: -4902,
    },
  ],
};

const predictorSchema = z.object({
  rank: z.coerce.number({ invalid_type_error: "Enter a valid rank" }).min(1, "Rank must be at least 1"),
  category: z.string().min(1, "Category is required"),
  gender: z.string().min(1, "Gender is required"),
  homeState: z.string().optional(),
  preferredBranch: z.string().optional(),
  type: z.string().optional(),
});

type PredictorFormValues = z.infer<typeof predictorSchema>;

export default function Predictor() {
  const [queryParams, setQueryParams] = useState<PredictorFormValues | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const form = useForm<PredictorFormValues>({
    resolver: zodResolver(predictorSchema),
    defaultValues: {
      rank: undefined,
      category: "OPEN",
      gender: "Gender-Neutral",
      homeState: "__any__",
      preferredBranch: "__any__",
      type: "__any__",
    },
  });

  const apiParams = queryParams
    ? {
        rank: queryParams.rank,
        category: queryParams.category,
        gender: queryParams.gender,
        ...(queryParams.type && queryParams.type !== "__any__" ? { type: queryParams.type } : {}),
        year: 2024,
      }
    : undefined;

  const { data: rawResults, isLoading } = useGetPredictorResults(
    apiParams as any,
    {
      query: {
        enabled: !!queryParams?.rank,
        queryKey: apiParams ? getGetPredictorResultsQueryKey(apiParams) : ["predictor-empty"],
        onSuccess: (data: any) => {
          const isEmpty = !data?.safe?.length && !data?.moderate?.length && !data?.ambitious?.length;
          setUseMockData(isEmpty);
        },
      },
    } as any
  );

  const results = useMockData ? MOCK_RESULTS as any : rawResults;

  // Client-side branch filter
  const filterByBranch = (list: any[]) => {
    if (!queryParams?.preferredBranch || queryParams.preferredBranch === "__any__") return list;
    const pref = queryParams.preferredBranch.toLowerCase();
    const filtered = list.filter((r) => r.branch.toLowerCase().includes(pref));
    return filtered.length > 0 ? filtered : list;
  };

  const onSubmit = (data: PredictorFormValues) => {
    setUseMockData(false);
    setQueryParams(data);
  };

  const totalResults = results
    ? (results.safe?.length ?? 0) + (results.moderate?.length ?? 0) + (results.ambitious?.length ?? 0)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500" id="predictor-section">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">College Predictor</h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Enter your JEE Rank and discover your best colleges instantly — based on real JOSAA cutoff data.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Panel */}
        <div className="lg:col-span-4" id="predictor-form">
          <Card className="border-slate-200 shadow-sm lg:sticky lg:top-20">
            <CardHeader className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-t-xl pb-5">
              <CardTitle className="text-white text-lg">Your JEE Profile</CardTitle>
              <CardDescription className="text-indigo-100">Fill in your details for accurate predictions</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* Rank */}
                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-500" />
                          JEE Main / Advanced Rank
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 5000"
                            className="border-slate-200 focus-visible:ring-indigo-400"
                            data-testid="input-rank"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200" data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OPEN">GEN / OPEN</SelectItem>
                            <SelectItem value="OBC-NCL">OBC-NCL</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                            <SelectItem value="EWS">EWS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm">Gender Quota</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200" data-testid="select-gender">
                              <SelectValue placeholder="Select gender quota" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Gender-Neutral">Gender-Neutral</SelectItem>
                            <SelectItem value="Female-only">Female-Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Home State */}
                  <FormField
                    control={form.control}
                    name="homeState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          Home State
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? "__any__"}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200" data-testid="select-home-state">
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-52">
                            <SelectItem value="__any__">Any State</SelectItem>
                            {INDIAN_STATES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preferred Branch */}
                  <FormField
                    control={form.control}
                    name="preferredBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          Preferred Branch
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? "__any__"}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200" data-testid="select-branch">
                              <SelectValue placeholder="Any branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-52">
                            <SelectItem value="__any__">Any Branch</SelectItem>
                            {BRANCHES.map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* College Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium text-sm">College Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? "__any__"}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200" data-testid="select-type">
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__any__">All Types</SelectItem>
                            <SelectItem value="IIT">IITs</SelectItem>
                            <SelectItem value="NIT">NITs</SelectItem>
                            <SelectItem value="IIIT">IIITs</SelectItem>
                            <SelectItem value="GFTI">GFTIs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 shadow-md shadow-indigo-100"
                    disabled={isLoading}
                    data-testid="button-predict"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Target className="mr-2 h-4 w-4" /> Predict My Colleges</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4 text-slate-400">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-600">Analyzing past cutoff trends...</p>
                <p className="text-sm mt-1">Matching your rank against 64+ records</p>
              </div>
            </div>
          ) : !results ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                  <Target className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready to predict</h3>
                <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                  Enter your rank, category, and gender in the form to discover which colleges you can get into across IITs, NITs, IIITs, and GFTIs.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Summary Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {totalResults} college options found
                    {useMockData && <span className="ml-2 text-xs text-amber-500 font-normal">(showing sample data)</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    For rank <strong className="text-indigo-600">{queryParams?.rank?.toLocaleString("en-IN")}</strong> · {queryParams?.category} · {queryParams?.gender}
                  </p>
                </div>
                <div className="flex gap-2">
                  <LegendPill color="emerald" label="High Chance" />
                  <LegendPill color="amber" label="Medium" />
                  <LegendPill color="red" label="Dream" />
                </div>
              </div>

              <Tabs defaultValue="safe" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl mb-5 h-auto">
                  <TabsTrigger value="safe" className="rounded-lg py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 data-[state=active]:font-semibold" data-testid="tab-safe">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Safe ({filterByBranch(results.safe ?? []).length})
                  </TabsTrigger>
                  <TabsTrigger value="moderate" className="rounded-lg py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700 data-[state=active]:font-semibold" data-testid="tab-moderate">
                    <Target className="w-3.5 h-3.5 mr-1.5" />
                    Moderate ({filterByBranch(results.moderate ?? []).length})
                  </TabsTrigger>
                  <TabsTrigger value="ambitious" className="rounded-lg py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-700 data-[state=active]:font-semibold" data-testid="tab-ambitious">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    Dream ({filterByBranch(results.ambitious ?? []).length})
                  </TabsTrigger>
                </TabsList>

                {(["safe", "moderate", "ambitious"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-3">
                      {filterByBranch(results[tab] ?? []).length > 0 ? (
                        filterByBranch(results[tab] ?? []).map((item: any, i: number) => (
                          <CollegeCard key={i} item={item} tab={tab} index={i} />
                        ))
                      ) : (
                        <Card className="border-dashed border-2 border-slate-200">
                          <CardContent className="py-12 text-center">
                            <p className="text-slate-400 text-sm">
                              No {tab} options found. Try adjusting your filters or branch preference.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[color]}`}>{label}</span>
  );
}

function CollegeCard({ item, tab, index }: { item: any; tab: string; index: number }) {
  const chanceConfig = {
    safe: {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      label: "High Chance",
      bar: "bg-emerald-500",
      accent: "border-l-emerald-500",
    },
    moderate: {
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      label: "Medium Chance",
      bar: "bg-amber-500",
      accent: "border-l-amber-500",
    },
    ambitious: {
      badge: "bg-rose-50 text-rose-700 border border-rose-200",
      label: "Dream College",
      bar: "bg-rose-500",
      accent: "border-l-rose-500",
    },
  };

  const cfg = chanceConfig[tab];
  const avgPkg = getAvgPackage(item.college.type ?? "NIT", item.branch);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 border-l-4 ${cfg.accent} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden`}
      data-testid={`college-card-${index}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
                {item.college.shortName}
              </span>
              <span className="text-xs text-slate-400">{item.college.type}</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-base leading-snug">{item.branch}</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{item.college.name}</p>
          </div>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-50">
          <Metric
            icon={<Award className="w-3.5 h-3.5 text-slate-400" />}
            label="Closing Rank"
            value={item.closingRank?.toLocaleString("en-IN") ?? "—"}
            highlight={false}
          />
          <Metric
            icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
            label="NIRF Rank"
            value={item.college.nirf ? `#${item.college.nirf}` : "—"}
            highlight={false}
          />
          <Metric
            icon={<Briefcase className="w-3.5 h-3.5 text-slate-400" />}
            label="Avg Package"
            value={avgPkg}
            highlight={false}
          />
          <Metric
            icon={<ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            label="Rank Gap"
            value={
              item.rankDifference === 0
                ? "At cutoff"
                : item.rankDifference > 0
                ? `+${item.rankDifference.toLocaleString("en-IN")}`
                : `${item.rankDifference.toLocaleString("en-IN")}`
            }
            highlight={true}
            positive={item.rankDifference >= 0}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  highlight,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight: boolean;
  positive?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-sm font-semibold ${
          highlight
            ? positive
              ? "text-emerald-600"
              : "text-rose-600"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
