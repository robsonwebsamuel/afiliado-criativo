import {
  Sparkles,
  History,
  LayoutGrid,
  Type,
  Link2,
  Scissors,
  HelpCircle,
  Home,
  Crown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { currentUser, planLimits } from "@/lib/mock-data";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Criar Nova Arte", url: "/criar", icon: Sparkles },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Templates", url: "/templates", icon: LayoutGrid },
  { title: "Gerar Legenda", url: "/legenda", icon: Type },
  { title: "Inserir Link", url: "/inserir-link", icon: Link2 },
];

const proItems = [
  { title: "Encurtar Link", url: "/encurtar", icon: Scissors },
];

const helpItems = [
  { title: "Ajuda", url: "/ajuda", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const limit = planLimits[currentUser.plan];
  const progress = Math.min((currentUser.artsCreatedToday / limit.daily) * 100, 100);
  const planLabel = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="backdrop-blur-md">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              AfiliadoCriativo
            </span>
          )}
        </div>

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-xs">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-elevated transition-all duration-200"
                      activeClassName="bg-elevated text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pro section */}
        {currentUser.plan === "pro" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-xs">
              Pro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {proItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-elevated transition-all duration-200"
                        activeClassName="bg-elevated text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Help */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-elevated transition-all duration-200"
                      activeClassName="bg-elevated text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="border-t border-border/50 p-4">
        {!collapsed && (
          <div className="space-y-3">
            {/* Usage bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Artes hoje</span>
                <span className="text-foreground font-medium tabular-nums">
                  {currentUser.artsCreatedToday}/{limit.daily === Infinity ? '∞' : limit.daily}
                </span>
              </div>
              <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${limit.daily === Infinity ? 10 : progress}%` }}
                />
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-sm font-display font-bold text-foreground">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  {currentUser.plan === 'pro' && <Crown className="w-3 h-3 text-accent" />}
                  <span className="text-xs text-muted-foreground capitalize">{planLabel}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
