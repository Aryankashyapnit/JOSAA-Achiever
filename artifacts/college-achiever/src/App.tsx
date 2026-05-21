import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Predictor from "@/pages/Predictor";
import Cutoffs from "@/pages/Cutoffs";
import Simulator from "@/pages/Simulator";
import Colleges from "@/pages/Colleges";
import About from "@/pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedLayout><Home /></ProtectedLayout>
      </Route>
      <Route path="/predictor">
        <ProtectedLayout><Predictor /></ProtectedLayout>
      </Route>
      <Route path="/cutoffs">
        <ProtectedLayout><Cutoffs /></ProtectedLayout>
      </Route>
      <Route path="/simulator">
        <ProtectedLayout><Simulator /></ProtectedLayout>
      </Route>
      <Route path="/colleges">
        <ProtectedLayout><Colleges /></ProtectedLayout>
      </Route>
      <Route path="/about">
        <ProtectedLayout><About /></ProtectedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
