import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Monitors from "@/pages/Monitors";
import Logs from "@/pages/Logs";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/monitors" component={Monitors} />
      <Route path="/logs" component={Logs} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1">
              <MobileHeader />
              <main className="flex-1 overflow-y-auto">
                <Router />
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
