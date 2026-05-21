import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetCollege, useGetSeatMatrix, getGetCollegeQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, MapPin, Globe, Building2, Users, Briefcase,
  TrendingUp, Home, GraduationCap, CheckCircle2, IndianRupee,
  Wifi, Utensils, Shield, Dumbbell,
} from "lucide-react";

// ── Mock enrichment data keyed by college shortName ──────────────────────────
const PLACEMENT_DATA: Record<string, { avgPackage: string; highestPackage: string; placementRate: number; topRecruiters: string[]; year: number }> = {
  "NIT Agartala": { avgPackage: "₹6.8 LPA", highestPackage: "₹28 LPA", placementRate: 76, topRecruiters: ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "L&T", "Tata Steel", "ONGC"], year: 2024 },
  "NIT Trichy":   { avgPackage: "₹14.5 LPA", highestPackage: "₹62 LPA", placementRate: 92, topRecruiters: ["Google", "Microsoft", "Amazon", "Flipkart", "Goldman Sachs", "JP Morgan", "Cisco", "Oracle"], year: 2024 },
  "IIT Bombay":   { avgPackage: "₹28 LPA", highestPackage: "₹3.67 Cr", placementRate: 98, topRecruiters: ["Google", "Microsoft", "Apple", "Meta", "Goldman Sachs", "McKinsey", "Boston Consulting"], year: 2024 },
  "IIT Delhi":    { avgPackage: "₹26 LPA", highestPackage: "₹2.4 Cr", placementRate: 97, topRecruiters: ["Google", "Microsoft", "Amazon", "Qualcomm", "DE Shaw", "Tower Research"], year: 2024 },
  "IIT Madras":   { avgPackage: "₹24 LPA", highestPackage: "₹2.05 Cr", placementRate: 96, topRecruiters: ["Google", "Microsoft", "NVIDIA", "Uber", "Bajaj Auto", "ITC", "Reliance"], year: 2024 },
  default:        { avgPackage: "₹8 LPA", highestPackage: "₹24 LPA", placementRate: 72, topRecruiters: ["TCS", "Infosys", "Wipro", "HCL", "L&T", "BHEL", "SAIL"], year: 2024 },
};

const FEES_DATA: Record<string, { tuitionPerSem: string; totalFees4Yr: string; hostelPerYear: string; messFees: string; otherFees: string; scholarships: string[] }> = {
  "NIT Agartala": { tuitionPerSem: "₹35,900", totalFees4Yr: "₹5.86 L", hostelPerYear: "₹28,000–40,000", messFees: "₹2,500/month", otherFees: "₹12,000/yr", scholarships: ["Central Sector Scholarship", "SC/ST Scholarship", "Merit-cum-Means", "AICTE Pragati/Saksham"] },
  "NIT Trichy":   { tuitionPerSem: "₹59,350", totalFees4Yr: "₹9.85 L", hostelPerYear: "₹45,000–65,000", messFees: "₹3,000/month", otherFees: "₹18,000/yr", scholarships: ["Central Sector Scholarship", "SC/ST Scholarship", "State Scholarship", "NIT Merit Award"] },
  "IIT Bombay":   { tuitionPerSem: "₹1,00,000", totalFees4Yr: "₹8–10 L", hostelPerYear: "₹60,000–90,000", messFees: "₹3,500/month", otherFees: "₹25,000/yr", scholarships: ["SC/ST Full Fee Waiver", "MCM Scholarship", "IITB Alumni Scholarship", "Aditya Birla Scholarship"] },
  default:        { tuitionPerSem: "₹42,500", totalFees4Yr: "₹6.5 L", hostelPerYear: "₹30,000–50,000", messFees: "₹2,800/month", otherFees: "₹14,000/yr", scholarships: ["Central Sector Scholarship", "SC/ST Scholarship", "Merit-cum-Means"] },
};

const HOSTEL_DATA: Record<string, { boysHostels: number; girlsHostels: number; totalCapacity: number; amenities: string[]; fees: string; notes: string }> = {
  "NIT Agartala": { boysHostels: 7, girlsHostels: 2, totalCapacity: 3200, amenities: ["24/7 Wi-Fi", "Mess", "Common Room", "Gym", "Medical", "Security"], fees: "₹28,000–40,000/year", notes: "All first-year students are guaranteed hostel accommodation. Allotment is done online based on JOSAA category." },
  "NIT Trichy":   { boysHostels: 9, girlsHostels: 3, totalCapacity: 5500, amenities: ["High-Speed Wi-Fi", "Cafeteria", "Gym", "Reading Room", "Laundry", "24/7 Security", "Medical"], fees: "₹45,000–65,000/year", notes: "AC rooms available at premium. 100% residential campus — all admitted students get hostel." },
  "IIT Bombay":   { boysHostels: 13, girlsHostels: 3, totalCapacity: 9000, amenities: ["Fibre Wi-Fi", "Restaurants", "Olympic Pool", "Gym", "Auditorium", "Convenience Store", "Medical"], fees: "₹60,000–90,000/year", notes: "All students are guaranteed hostel accommodation throughout their degree. Multiple mess options available." },
  default:        { boysHostels: 5, girlsHostels: 2, totalCapacity: 2000, amenities: ["Wi-Fi", "Mess", "Common Room", "Medical"], fees: "₹30,000–50,000/year", notes: "First-year students are given priority for hostel allotment." },
};

// Fallback sample for NIT Agartala when API doesn't have it
const NIT_AGARTALA_FALLBACK = {
  id: 99,
  name: "National Institute of Technology Agartala",
  shortName: "NIT Agartala",
  type: "NIT",
  state: "Tripura",
  city: "Agartala",
  nirf: 65,
  established: 1965,
  totalSeats: 1780,
  website: "https://www.nita.ac.in",
  description: "National Institute of Technology Agartala is a premier technical institution in North East India. Established in 1965 as a Regional Engineering College, it attained NIT status in 2006 and is fully funded by the Government of India.",
  branches: ["Computer Science and Engineering", "Electronics and Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Production Engineering", "Mathematics and Computing"],
};

export default function CollegeDetail() {
  const [, params] = useRoute("/colleges/:id");
  const [, navigate] = useLocation();
  const collegeId = params?.id ? parseInt(params.id) : undefined;

  const { data: college, isLoading } = useGetCollege(
    collegeId!,
    { query: { enabled: !!collegeId, queryKey: collegeId ? getGetCollegeQueryKey(collegeId) : ["college-empty"] } },
  );

  const { data: seatMatrix } = useGetSeatMatrix(
    { collegeId: collegeId!, year: 2024 },
    { query: { enabled: !!collegeId } },
  );

  // Use API data if available, else NIT Agartala fallback for demo
  const c = college ?? (collegeId ? undefined : NIT_AGARTALA_FALLBACK as any);

  const placementKey = c?.shortName ?? "default";
  const placements = PLACEMENT_DATA[placementKey] ?? PLACEMENT_DATA["default"];
  const fees = FEES_DATA[placementKey] ?? FEES_DATA["default"];
  const hostel = HOSTEL_DATA[placementKey] ?? HOSTEL_DATA["default"];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!c && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="w-12 h-12 text-slate-200 mb-4" />
        <p className="font-semibold text-slate-700">College not found</p>
        <button onClick={() => navigate("/colleges")} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">
          Browse all colleges
        </button>
      </div>
    );
  }

  const displayCollege = c!;

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/colleges")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Colleges
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-7 text-white border border-indigo-900/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {displayCollege.type}
              </span>
              {displayCollege.nirf && (
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  NIRF #{displayCollege.nirf}
                </span>
              )}
              {displayCollege.established && (
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Est. {displayCollege.established}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-1">{displayCollege.name}</h1>
            <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{displayCollege.city}, {displayCollege.state}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center bg-white/10 rounded-xl p-3 text-center min-w-[80px]">
            <span className="text-2xl font-bold">{displayCollege.totalSeats ?? "—"}</span>
            <span className="text-xs text-slate-300 mt-0.5">Total Seats</span>
          </div>
        </div>

        {displayCollege.description && (
          <p className="text-slate-300 text-sm leading-relaxed mt-4 border-t border-white/10 pt-4">
            {displayCollege.description}
          </p>
        )}

        {displayCollege.website && (
          <a
            href={displayCollege.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-indigo-300 hover:text-indigo-200 text-xs font-medium transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> {displayCollege.website.replace("https://", "")}
          </a>
        )}
      </div>

      {/* ── Thumb-friendly Tab Sections ── */}
      <Tabs defaultValue="placements" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-slate-100 p-1 rounded-xl h-auto" data-testid="college-tabs">
          <TabsTrigger
            value="placements"
            className="rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 flex flex-col sm:flex-row items-center gap-1"
            data-testid="tab-placements"
          >
            <Briefcase className="w-4 h-4" />
            <span>Placements</span>
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 flex flex-col sm:flex-row items-center gap-1"
            data-testid="tab-fees"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger
            value="hostel"
            className="rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 flex flex-col sm:flex-row items-center gap-1"
            data-testid="tab-hostel"
          >
            <Home className="w-4 h-4" />
            <span>Hostel</span>
          </TabsTrigger>
        </TabsList>

        {/* ── PLACEMENTS ── */}
        <TabsContent value="placements" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Avg Package" value={placements.avgPackage} icon={<TrendingUp className="w-4 h-4" />} color="indigo" />
            <StatTile label="Highest Package" value={placements.highestPackage} icon={<Briefcase className="w-4 h-4" />} color="violet" />
            <StatTile label="Placement Rate" value={`${placements.placementRate}%`} icon={<GraduationCap className="w-4 h-4" />} color="emerald" />
          </div>
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Top Recruiters ({placements.year})
              </p>
              <div className="flex flex-wrap gap-2">
                {placements.topRecruiters.map((r) => (
                  <span key={r} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors cursor-default">
                    {r}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seat Matrix snippet */}
          {seatMatrix && seatMatrix.length > 0 && (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Seat Matrix 2024 (sample)
                </p>
                <div className="space-y-2">
                  {seatMatrix.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.branch}</p>
                        <p className="text-xs text-slate-400">{s.category} · {s.gender}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{s.totalSeats} seats</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── FEES ── */}
        <TabsContent value="fees" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Tuition / Semester" value={fees.tuitionPerSem} icon={<IndianRupee className="w-4 h-4" />} color="indigo" />
            <StatTile label="Total Fees (4 Yr)" value={fees.totalFees4Yr} icon={<GraduationCap className="w-4 h-4" />} color="violet" />
            <StatTile label="Hostel / Year" value={fees.hostelPerYear} icon={<Home className="w-4 h-4" />} color="sky" />
            <StatTile label="Mess Fees" value={fees.messFees} icon={<Utensils className="w-4 h-4" />} color="emerald" />
          </div>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Scholarships Available
              </p>
              <div className="space-y-2">
                {fees.scholarships.map((s) => (
                  <div key={s} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Note:</strong> Fee structure is indicative and subject to revision by the institute. SC/ST students may be exempt from tuition fees per MHRD guidelines. Verify exact figures from the official institute website before making decisions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HOSTEL INFO ── */}
        <TabsContent value="hostel" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Boys Hostels" value={`${hostel.boysHostels}`} icon={<Home className="w-4 h-4" />} color="indigo" />
            <StatTile label="Girls Hostels" value={`${hostel.girlsHostels}`} icon={<Home className="w-4 h-4" />} color="violet" />
            <StatTile label="Total Capacity" value={hostel.totalCapacity.toLocaleString("en-IN")} icon={<Users className="w-4 h-4" />} color="sky" />
          </div>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-500" />
                Hostel Amenities
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hostel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{a}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">Hostel Fees</p>
                  <p className="text-sm text-slate-500">{hostel.fees}</p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{hostel.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branches offered */}
          {displayCollege.branches && displayCollege.branches.length > 0 && (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  Branches Offered
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayCollege.branches.map((b: string) => (
                    <span key={b} className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatTile({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>{icon}</div>
        <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}
