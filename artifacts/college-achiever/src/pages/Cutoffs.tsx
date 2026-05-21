import { useState } from "react";
import { useListCutoffs, useGetCutoffTrends, useListColleges, getGetCutoffTrendsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Search, LineChart as LineChartIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Cutoffs() {
  const [filters, setFilters] = useState({
    collegeId: undefined as number | undefined,
    category: "OPEN",
    gender: "Gender-Neutral",
    year: 2023,
    round: 6,
    page: 1,
    limit: 50
  });

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const { data: collegesData } = useListColleges({ limit: 200 });
  
  const { data: cutoffsData, isLoading } = useListCutoffs(filters);

  const { data: trendsData, isLoading: trendsLoading } = useGetCutoffTrends(
    { 
      collegeId: selectedRow?.collegeId || 0,
      branch: selectedRow?.branch || "",
      category: selectedRow?.category || "",
      gender: selectedRow?.gender || ""
    },
    {
      query: {
        enabled: !!selectedRow,
        queryKey: selectedRow ? getGetCutoffTrendsQueryKey({
          collegeId: selectedRow.collegeId,
          branch: selectedRow.branch,
          category: selectedRow.category,
          gender: selectedRow.gender
        }) : ["trends-empty"]
      }
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cutoff Database</h1>
        <p className="text-muted-foreground">Search and analyze historical JOSAA opening and closing ranks.</p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">College</label>
            <Select 
              value={filters.collegeId?.toString() || "ALL"} 
              onValueChange={(val) => setFilters(f => ({ ...f, collegeId: val === "ALL" ? undefined : parseInt(val), page: 1 }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Colleges</SelectItem>
                {collegesData?.colleges.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.shortName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Category</label>
            <Select 
              value={filters.category} 
              onValueChange={(val: any) => setFilters(f => ({ ...f, category: val, page: 1 }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">OPEN</SelectItem>
                <SelectItem value="OBC-NCL">OBC-NCL</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="EWS">EWS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Year</label>
            <Select 
              value={filters.year.toString()} 
              onValueChange={(val) => setFilters(f => ({ ...f, year: parseInt(val), page: 1 }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Round</label>
            <Select 
              value={filters.round.toString()} 
              onValueChange={(val) => setFilters(f => ({ ...f, round: parseInt(val), page: 1 }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(r => (
                  <SelectItem key={r} value={r.toString()}>Round {r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            className="w-full bg-white"
            onClick={() => setFilters({ collegeId: undefined, category: "OPEN", gender: "Gender-Neutral", year: 2023, round: 6, page: 1, limit: 50 })}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="rounded-md border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Closing</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-4" />
                    <span className="text-muted-foreground">Loading cutoffs...</span>
                  </TableCell>
                </TableRow>
              ) : cutoffsData?.cutoffs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                    No records found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                cutoffsData?.cutoffs.map((cutoff) => (
                  <TableRow key={cutoff.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{cutoff.collegeName}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate" title={cutoff.branch}>
                      {cutoff.branch}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{cutoff.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-600">{cutoff.openingRank}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{cutoff.closingRank}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedRow(cutoff)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                      >
                        <LineChartIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination placeholder */}
        {cutoffsData && cutoffsData.total > filters.limit && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(filters.page - 1) * filters.limit + 1} to Math.min(filters.page * filters.limit, cutoffsData.total) of {cutoffsData.total} entries
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={filters.page === 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={filters.page * filters.limit >= cutoffsData.total}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Trend Dialog */}
      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Historical Cutoff Trend</DialogTitle>
            <DialogDescription>
              {selectedRow?.collegeName} • {selectedRow?.branch} • {selectedRow?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[300px] mt-6 w-full">
            {trendsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : trendsData && trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData.sort((a, b) => a.year - b.year)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis 
                    reversed 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="closingRank" 
                    stroke="#6366F1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} 
                    activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
                    name="Closing Rank"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No historical trend data available.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
