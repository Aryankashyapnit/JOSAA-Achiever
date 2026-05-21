import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSimulateCounselling, useListColleges, PreferenceItem } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, GripVertical, Trash2, Trophy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const simulatorSchema = z.object({
  rank: z.coerce.number().min(1, "Rank must be at least 1"),
  category: z.string().min(1, "Category is required"),
  gender: z.string().min(1, "Gender is required"),
});

export default function Simulator() {
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("Computer Science and Engineering");

  const form = useForm<z.infer<typeof simulatorSchema>>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: { rank: undefined, category: "OPEN", gender: "Gender-Neutral" },
  });

  const { data: collegesData } = useListColleges({ limit: 100 });
  const simulateMutation = useSimulateCounselling();

  const addPreference = () => {
    if (!selectedCollege || !selectedBranch) return;
    const collegeId = parseInt(selectedCollege);
    
    setPreferences([
      ...preferences,
      { collegeId, branch: selectedBranch, category: form.getValues().category, gender: form.getValues().gender }
    ]);
    setSelectedCollege("");
  };

  const removePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const movePreference = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newPrefs = [...preferences];
      [newPrefs[index - 1], newPrefs[index]] = [newPrefs[index], newPrefs[index - 1]];
      setPreferences(newPrefs);
    } else if (direction === 'down' && index < preferences.length - 1) {
      const newPrefs = [...preferences];
      [newPrefs[index], newPrefs[index + 1]] = [newPrefs[index + 1], newPrefs[index]];
      setPreferences(newPrefs);
    }
  };

  const onSubmit = (data: z.infer<typeof simulatorSchema>) => {
    if (preferences.length === 0) return;
    
    simulateMutation.mutate({
      data: {
        ...data,
        preferences: preferences.map(p => ({ ...p, category: data.category, gender: data.gender }))
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mock Counselling Simulator</h1>
        <p className="text-muted-foreground">Test your preference list against historical data to see your likely allotment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="rank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rank</FormLabel>
                          <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
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
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="OPEN">OPEN</SelectItem>
                              <SelectItem value="OBC-NCL">OBC-NCL</SelectItem>
                              <SelectItem value="SC">SC</SelectItem>
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
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Gender-Neutral">Neutral</SelectItem>
                              <SelectItem value="Female-only">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choice Filling</CardTitle>
              <CardDescription>Add colleges to your preference list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium">College</label>
                  <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                    <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                    <SelectContent>
                      {collegesData?.colleges.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.shortName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium">Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science and Engineering">Computer Science</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical</SelectItem>
                      <SelectItem value="Civil Engineering">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addPreference} disabled={!selectedCollege}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 border rounded-md divide-y">
                {preferences.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No preferences added yet.
                  </div>
                ) : (
                  preferences.map((pref, idx) => {
                    const college = collegesData?.colleges.find(c => c.id === pref.collegeId);
                    return (
                      <div key={idx} className="p-3 flex items-center gap-3 bg-white hover:bg-slate-50">
                        <span className="text-sm font-bold text-slate-400 w-6 text-center">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900">{college?.shortName}</p>
                          <p className="text-xs text-muted-foreground">{pref.branch}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePreference(idx, 'up')} disabled={idx === 0}>
                            ↑
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePreference(idx, 'down')} disabled={idx === preferences.length - 1}>
                            ↓
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removePreference(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={preferences.length === 0 || simulateMutation.isPending}
              >
                {simulateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Run Simulation
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          {simulateMutation.data ? (
            <Card className="border-indigo-100 shadow-md">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 rounded-t-xl pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl text-indigo-900">Simulation Result</CardTitle>
                </div>
                <CardDescription>Based on historical cutoff data for your profile.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {simulateMutation.data.allottedCollege ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-emerald-800 mb-1">Seat Allotted in Round {simulateMutation.data.round}</p>
                      <p className="text-lg font-bold text-emerald-950">{simulateMutation.data.allottedCollege}</p>
                      <p className="text-emerald-700">{simulateMutation.data.allottedBranch}</p>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Simulation Summary</AlertTitle>
                      <AlertDescription>
                        {simulateMutation.data.message} Checked {simulateMutation.data.checkedPreferences} choices before finding a match.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
                    <p className="text-lg font-bold text-red-900 mb-2">No Seat Allotted</p>
                    <p className="text-sm text-red-700">{simulateMutation.data.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <ListChecks className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Awaiting Simulation</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Add colleges to your preference list and run the simulation to see which seat you might be allotted.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ListChecks(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}
