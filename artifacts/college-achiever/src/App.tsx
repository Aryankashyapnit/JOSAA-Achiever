import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

// Pages
import AdminPage from "@/pages/AdminPage";
import AdminCutoffsPage from "@/pages/AdminCutoffsPage";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Predictor from "@/pages/Predictor";
import Cutoffs from "@/pages/Cutoffs";
import Simulator from "@/pages/Simulator";
import Colleges from "@/pages/Colleges";
import CollegeDetail from "@/pages/CollegeDetail";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
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

      {/* Public legal pages — wrapped in layout but not protected */}
      <Route path="/privacy">
        <Layout><PrivacyPolicy /></Layout>
      </Route>
      <Route path="/terms">
        <Layout><TermsOfService /></Layout>
      </Route>

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
      <Route path="/colleges/:id">
        <ProtectedLayout><CollegeDetail /></ProtectedLayout>
      </Route>
      <Route path="/colleges">
        <ProtectedLayout><Colleges /></ProtectedLayout>
      </Route>
      <Route path="/about">
        <ProtectedLayout><About /></ProtectedLayout>
      </Route>
      <Route path="/admin/upload">
        <ProtectedLayout><AdminPage /></ProtectedLayout>
      </Route>
      <Route path="/admin/cutoffs-ingest">
        <ProtectedLayout><AdminCutoffsPage /></ProtectedLayout>
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
