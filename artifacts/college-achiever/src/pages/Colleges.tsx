import { useState } from "react";
import { useListColleges, useGetCollege, useGetSeatMatrix } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, Building, Globe, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Colleges() {
  const [search, setSearch] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);

  const { data: collegesData, isLoading } = useListColleges({ search: search || undefined, limit: 100 });
  const { data: detailData, isLoading: detailLoading } = useGetCollege(selectedCollegeId || 0, {
    query: { enabled: !!selectedCollegeId }
  });
  const { data: seatData, isLoading: seatLoading } = useGetSeatMatrix({ collegeId: selectedCollegeId || 0 }, {
    query: { enabled: !!selectedCollegeId }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">College Explorer</h1>
          <p className="text-muted-foreground">Browse all participating institutes in JOSAA counselling.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search colleges..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collegesData?.colleges.map(college => (
            <Card 
              key={college.id} 
              className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden"
              onClick={() => setSelectedCollegeId(college.id)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={
                    college.type === 'IIT' ? 'default' : 
                    college.type === 'NIT' ? 'secondary' : 'outline'
                  } className={college.type === 'IIT' ? 'bg-indigo-600' : ''}>
                    {college.type}
                  </Badge>
                  {college.nirf && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      NIRF #{college.nirf}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{college.shortName}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-4">{college.name}</p>
                <div className="flex items-center text-xs text-slate-500 pt-4 border-t">
                  <MapPin className="h-3 w-3 mr-1" />
                  {college.city}, {college.state}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selectedCollegeId} onOpenChange={(open) => !open && setSelectedCollegeId(null)}>
        <SheetContent className="w-full sm:max-w-xl sm:w-[540px] overflow-hidden flex flex-col p-0 border-l border-slate-200">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : detailData ? (
            <>
              <div className="bg-slate-900 text-white p-6 pb-8 shrink-0">
                <Badge className="bg-indigo-500 hover:bg-indigo-600 mb-4">{detailData.type}</Badge>
                <SheetTitle className="text-2xl font-bold text-white mb-2">{detailData.name}</SheetTitle>
                <SheetDescription className="text-slate-300 flex items-center gap-4 text-sm">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {detailData.city}, {detailData.state}</span>
                  <span className="flex items-center"><Building className="h-4 w-4 mr-1" /> Est. {detailData.established || "N/A"}</span>
                </SheetDescription>
              </div>

              <ScrollArea className="flex-1 p-6 bg-slate-50">
                <div className="space-y-8 pb-10">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Total Seats</p>
                          <p className="text-xl font-bold text-slate-900">{detailData.totalSeats || "N/A"}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-700">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-500">Website</p>
                          {detailData.website ? (
                            <a href={detailData.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                              Visit Site
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-slate-900">N/A</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="branches">
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                      <TabsTrigger value="branches">Branches Offered</TabsTrigger>
                      <TabsTrigger value="seats">Seat Matrix (2023)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="branches" className="space-y-2">
                      {detailData.branches.map((b, i) => (
                        <div key={i} className="bg-white p-3 rounded-md border border-slate-200 text-sm font-medium text-slate-800 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mr-3" />
                          {b}
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="seats">
                      {seatLoading ? (
                        <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" /></div>
                      ) : seatData?.length ? (
                        <div className="rounded-md border bg-white overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Seats</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {seatData.slice(0, 50).map((s) => (
                                <TableRow key={s.id}>
                                  <TableCell className="max-w-[150px] truncate text-xs" title={s.branch}>{s.branch}</TableCell>
                                  <TableCell className="text-xs"><Badge variant="outline">{s.category}</Badge></TableCell>
                                  <TableCell className="text-right font-medium">{s.totalSeats}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {seatData.length > 50 && (
                            <div className="p-2 text-center text-xs text-muted-foreground border-t bg-slate-50">
                              Showing first 50 rows only
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-white rounded-md border text-slate-500 text-sm">
                          No seat matrix data available.
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
