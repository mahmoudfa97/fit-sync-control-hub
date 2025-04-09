
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ActivitySquare, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Dumbbell, 
  UserRound, 
  KeyRound, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut
} from "lucide-react";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  collapsed: boolean;
}

const NavItem = ({ icon: Icon, label, to, collapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-x-2 px-3 py-2 rounded-md text-sm transition-colors",
          collapsed ? "justify-center" : "",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "")} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

const navItems = [
  { icon: ActivitySquare, label: "לוח בקרה", to: "/" },
  { icon: Users, label: "חברים", to: "/members" },
  { icon: CalendarCheck, label: "כניסות", to: "/checkins" },
  { icon: CreditCard, label: "תשלומים", to: "/payments" },
  { icon: Dumbbell, label: "שיעורים", to: "/classes" },
  { icon: UserRound, label: "צוות", to: "/staff" },
  { icon: KeyRound, label: "בקרת גישה", to: "/access" },
  { icon: Settings, label: "הגדרות", to: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-sidebar h-screen flex-shrink-0 border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-sidebar-foreground">ספרטה ג'ים</span>
          </div>
        )}
        {collapsed && <Dumbbell className="h-6 w-6 text-primary" />}
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-sidebar-foreground",
            collapsed ? "mt-4" : ""
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-1 px-2 flex-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            collapsed={collapsed}
            {...item}
          />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 ml-2" />
          {!collapsed && <span>התנתק</span>}
        </Button>
      </div>
    </aside>
  );
}
