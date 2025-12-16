import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: "dashboard",
    filled: true,
  },
  {
    title: "Monitors",
    url: "/monitors",
    icon: "monitoring",
    filled: false,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: "receipt_long",
    filled: false,
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: "notifications",
    filled: false,
    badge: 0,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: "settings",
    filled: false,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-foreground/10">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "20px" }}
            >
              ecg_heart
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-app-title">
            PulseWatch
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-full px-4 py-3 transition-all ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-foreground/70"
                      }`}
                      data-testid={`nav-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <span 
                          className="material-symbols-outlined"
                          style={{ 
                            fontVariationSettings: isActive && item.filled 
                              ? "'FILL' 1" 
                              : "'FILL' 0" 
                          }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-semibold">{item.title}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto text-xs px-2 py-0.5"
                            data-testid={`badge-${item.title.toLowerCase()}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div 
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-foreground/5 hover-elevate cursor-pointer transition-colors"
          data-testid="user-profile-card"
        >
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              AM
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-bold truncate" data-testid="text-username">
              Alex Morgan
            </p>
            <p className="text-xs text-muted-foreground truncate">
              alex@pulsewatch.io
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
