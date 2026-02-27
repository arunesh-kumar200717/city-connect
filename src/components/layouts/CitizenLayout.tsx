import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Plus, FileText, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navLinks = [
    { to: "/citizen/new-complaint", icon: Plus, label: "New Complaint" },
    { to: "/citizen/my-complaints", icon: FileText, label: "My Complaints" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-card shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/citizen/my-complaints" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">SmartCity</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === l.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-2 text-muted-foreground">
              <LogOut className="mr-1 h-4 w-4" />
              Sign Out
            </Button>
          </nav>

          {/* Mobile toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="border-t md:hidden">
            <div className="container space-y-1 py-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    location.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start text-muted-foreground">
                <LogOut className="mr-1 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 bg-background">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
