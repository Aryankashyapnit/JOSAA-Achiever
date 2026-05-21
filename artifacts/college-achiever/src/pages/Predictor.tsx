import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetPredictorResults, getGetPredictorResultsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingDown, Target, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const predictorSchema = z.object({
  rank: z.coerce.number().min(1, "Rank must be at least 1"),
  category: z.string().min(1, "Category is required"),
  gender: z.string().min(1, "Gender is required"),
  type: z.string().optional(),
});

type PredictorFormValues = z.infer<typeof predictorSchema>;

export default function Predictor() {
  const [queryParams, setQueryParams] = useState<PredictorFormValues | null>(null);

  const form = useForm<PredictorFormValues>({
    resolver: zodResolver(predictorSchema),
    defaultValues: {
      rank: undefined,
      category: "OPEN",
      gender: "Gender-Neutral",
      type: "ALL",
    },
  });

  const { data: results, isLoading } = useGetPredictorResults(
    queryParams as PredictorFormValues,
    {
      query: {
        enabled: !!queryParams?.rank,
        queryKey: queryParams ? getGetPredictorResultsQueryKey(queryParams) : ["predictor-empty"],
      },
    }
  );

  const onSubmit = (data: PredictorFormValues) => {
    setQueryParams(data);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">College Predictor</h1>
        <p className="text-muted-foreground">Find out which colleges you can get into based on your JEE rank.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4 h-fit sticky top-20 border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Enter your details to generate predictions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JEE Rank</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 15000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">OPEN</SelectItem>
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

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender quota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gender-Neutral">Gender-Neutral</SelectItem>
                          <SelectItem value="Female-only">Female-only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ALL">All Types</SelectItem>
                          <SelectItem value="IIT">IITs Only</SelectItem>
                          <SelectItem value="NIT">NITs Only</SelectItem>
                          <SelectItem value="IIIT">IIITs Only</SelectItem>
                          <SelectItem value="GFTI">GFTIs Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run Prediction
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
              <p>Analyzing past cutoff trends...</p>
            </div>
          ) : !results ? (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 border-dashed">
              <Target className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Ready to predict</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Enter your rank and category details in the form to see your chances across IITs, NITs, and other colleges.
              </p>
            </Card>
          ) : (
            <Tabs defaultValue="safe" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="safe" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Safe ({results.safe?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="moderate" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                  <Target className="w-4 h-4 mr-2" /> Moderate ({results.moderate?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="ambitious" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
                  <TrendingDown className="w-4 h-4 mr-2" /> Ambitious ({results.ambitious?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              {(["safe", "moderate", "ambitious"] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4 pb-4">
                      {results[tab]?.length ? (
                        results[tab].map((item, i) => (
                          <Card key={i} className="overflow-hidden transition-all hover:shadow-md border-slate-200">
                            <div className="flex flex-col sm:flex-row">
                              <div className="p-4 sm:p-6 flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Badge variant="outline" className="mb-2 bg-slate-50">{item.college.shortName}</Badge>
                                    <h3 className="font-semibold text-lg leading-tight text-slate-900">{item.branch}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{item.college.name}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Category</span>
                                    <span className="font-medium">{item.category}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Closing Rank</span>
                                    <span className="font-medium">{item.closingRank}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Rank Gap</span>
                                    <span className={`font-medium ${
                                      (item.rankDifference ?? 0) > 0 ? "text-emerald-600" : "text-amber-600"
                                    }`}>
                                      {(item.rankDifference ?? 0) > 0 ? "+" : ""}{item.rankDifference}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className={`w-full sm:w-2 ${
                                tab === 'safe' ? 'bg-emerald-500' : 
                                tab === 'moderate' ? 'bg-blue-500' : 'bg-amber-500'
                              }`} />
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center p-12 bg-white rounded-lg border">
                          <p className="text-muted-foreground">No {tab} options found for your rank.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
