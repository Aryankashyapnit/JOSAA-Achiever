import { useAuth } from "@/context/AuthContext";
import { useGetDashboardStats, useGetTopColleges, useListCounsellingRounds } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BookOpen, GraduationCap, MapPin, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topColleges, isLoading: topCollegesLoading } = useGetTopColleges({ limit: 5 });
  const { data: rounds, isLoading: roundsLoading } = useListCounsellingRounds();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here is your JOSAA counselling overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Colleges" 
          value={stats?.totalColleges} 
          icon={Building2} 
          loading={statsLoading} 
        />
        <StatCard 
          title="IITs & NITs" 
          value={stats ? stats.iitCount + stats.nitCount : undefined} 
          icon={GraduationCap} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Branches" 
          value={stats?.totalBranches} 
          icon={BookOpen} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Cutoff Records" 
          value={stats?.totalCutoffRecords} 
          icon={MapPin} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Access */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Counselling Timeline</CardTitle>
            <CardDescription>Upcoming JOSAA rounds and important dates</CardDescription>
          </CardHeader>
          <CardContent>
            {roundsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {rounds?.map((round) => (
                  <div key={round.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card text-card-foreground">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      round.status === 'active' ? 'bg-primary text-primary-foreground' : 
                      round.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {round.roundNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Round {round.roundNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        round.status === 'active' ? 'bg-primary/10 text-primary' : 
                        round.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {round.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {!rounds?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming rounds scheduled.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Colleges */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Engineering Colleges</CardTitle>
            <CardDescription>Highest ranked institutions in India</CardDescription>
          </CardHeader>
          <CardContent>
            {topCollegesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topColleges?.map((college, idx) => (
                  <Link href={`/colleges?search=${college.shortName}`} key={college.id} className="flex items-center gap-4 group">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground font-semibold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {college.shortName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{college.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading }: { title: string, value?: number, icon: any, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value?.toLocaleString() || "0"}</div>
        )}
      </CardContent>
    </Card>
  );
}
