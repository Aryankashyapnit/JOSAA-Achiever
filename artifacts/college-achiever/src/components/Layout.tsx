import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@workspace/api-client-react";
import {
  Home, LineChart, Table2, ListChecks, Building2,
  Info, LogOut, Loader2, GraduationCap, ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Predictor", href: "/predictor", icon: LineChart },
  { name: "Cutoffs", href: "/cutoffs", icon: Table2 },
  { name: "Simulator", href: "/simulator", icon: ListChecks },
  { name: "Colleges", href: "/colleges", icon: Building2 },
  { name: "About", href: "/about", icon: Info },
  { name: "Admin", href: "/admin/upload", icon: ShieldCheck },
];

// Bottom nav shows 5 items; "More" maps to About
const bottomNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Predict", href: "/predictor", icon: LineChart },
  { name: "Cutoffs", href: "/cutoffs", icon: Table2 },
  { name: "Simulate", href: "/simulator", icon: ListChecks },
  { name: "More", href: "/about", icon: Info },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        setLocation("/login");
      },
    });
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground flex flex-col">
      {/* ── Desktop Top Nav ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-logo">
              <div className="bg-indigo-600 text-white rounded-lg p-1.5 group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="h-4.5 w-4.5" />
              </div>
              <span className="hidden font-bold sm:inline-block tracking-tight text-slate-900">College Achiever</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium" data-testid="desktop-nav">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors px-3.5 py-2 rounded-lg text-sm ${
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Area */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.jeeRank ? `Rank ${user.jeeRank.toLocaleString("en-IN")}` : user.category ?? "No rank set"}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-indigo-100">
                    <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                  title="Sign out"
                >
                  {logoutMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <LogOut className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Footer (desktop only) ── */}
      <footer className="hidden md:block border-t border-slate-100 bg-white mt-auto">
        <div className="container max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white rounded-md p-1">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-700">College Achiever</span>
            <span className="text-slate-300 text-sm mx-1">·</span>
            <span className="text-xs text-slate-400">
              Data sourced from official JOSAA records. For informational use only.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <Link href="/about" className="hover:text-indigo-600 transition-colors" data-testid="footer-about">About</Link>
            <Link href="/about#contact" className="hover:text-indigo-600 transition-colors" data-testid="footer-contact">Contact</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors" data-testid="footer-privacy">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors" data-testid="footer-terms">Terms of Service</Link>
            <span className="text-slate-200">© {new Date().getFullYear()} College Achiever</span>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]"
        data-testid="bottom-nav"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around items-center h-16 px-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
                data-testid={`bottom-nav-${item.name.toLowerCase()}`}
              >
                <div className={`p-1 rounded-lg transition-colors ${active ? "bg-indigo-50" : ""}`}>
                  <Icon className={`h-5 w-5 ${active ? "stroke-indigo-600" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium leading-none ${active ? "text-indigo-600" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile footer legal links */}
        <div className="flex justify-center gap-4 pb-1 pt-0.5 border-t border-slate-50">
          <Link href="/privacy" className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors">Privacy</Link>
          <Link href="/terms" className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors">Terms</Link>
        </div>
      </nav>
    </div>
  );
}
