
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
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
  MessagesSquareIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  LucideSettings,
  Group,
} from "lucide-react";
import { t } from "@/utils/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import logo from '@/assets/logo.png';

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
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "")} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

const navItems = [
  { icon: ActivitySquare, label: t("dashboard_menu"), to: "/" },
  { icon: Users, label: t("members_menu"), to: "/members" },
  { icon: CalendarCheck, label: t("checkins_menu"), to: "/checkins" },
  { icon: FileText, label: t("invoices_menu"), to: "/reportscenter" },
  { icon: Dumbbell, label: t("classes_menu"), to: "/classes" },
  { icon: UserRound, label: t("staff_menu"), to: "/staff" },
  { icon: MessagesSquareIcon, label: t("messages_center"), to: "/messages" },
  { icon: Group, label: t("groupSubscriptions"), to: "/group-subscriptions" },
  { icon: LucideSettings, label: t("admin"), to: "/assets" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { currentOrganization } = useOrganization();
  
  const handleSignOut = async () => { 
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const organizationLogo = currentOrganization?.logo_url || logo;
  const organizationName = currentOrganization?.name || "המכון שלי";

  return (
    <aside className={cn("bg-sidebar h-screen flex-shrink-0 border-r border-sidebar-border flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={organizationLogo} alt={organizationName} className="h-12 w-12 object-cover rounded-lg" />
              <span className="font-semibold text-lg">{organizationName}</span>
            </Link>
          </div>
        ) : (
          <img src={organizationLogo} alt={organizationName} className="h-12 w-12 object-cover rounded-lg" />
        )}

        <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-sidebar-foreground", collapsed ? "mt-4" : "")} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-1 px-2 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.to} collapsed={collapsed} {...item} />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button
          variant="ghost"
          onClick={() => handleSignOut()}
          className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground", collapsed && "justify-center")}
        >
          <LogOut className="h-5 w-5 ml-2" />
          {!collapsed && <span>{t("logout")}</span>}
        </Button>
      </div>
    </aside>
  );
}
