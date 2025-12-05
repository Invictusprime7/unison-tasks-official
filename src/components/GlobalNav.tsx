import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Folder,
  Palette,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/files", label: "Files", icon: Folder },
  { path: "/design-studio", label: "Design Studio", icon: Palette },
  { path: "/crm", label: "CRM", icon: Users },
];

export function GlobalNav() {
  const location = useLocation();

  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg text-foreground">
          Lovable
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Nav */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="sm">
              Menu <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {navItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
