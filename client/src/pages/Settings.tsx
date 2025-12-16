import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function Settings() {
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-3xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          data-testid="text-page-title"
        >
          Settings
        </h2>
        <p className="text-muted-foreground text-base">
          Configure your monitoring preferences
        </p>
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold">General Settings</h3>
        
        <div className="flex items-center justify-between py-4 border-b border-foreground/5">
          <div className="space-y-1">
            <Label className="text-base">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark themes
            </p>
          </div>
          <Switch defaultChecked data-testid="switch-dark-mode" />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-foreground/5">
          <div className="space-y-1">
            <Label className="text-base">Auto-refresh Dashboard</Label>
            <p className="text-sm text-muted-foreground">
              Automatically refresh stats every 30 seconds
            </p>
          </div>
          <Switch defaultChecked data-testid="switch-auto-refresh" />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="space-y-1">
            <Label className="text-base">Compact View</Label>
            <p className="text-sm text-muted-foreground">
              Show more monitors in a condensed layout
            </p>
          </div>
          <Switch data-testid="switch-compact-view" />
        </div>
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold">Quick Actions</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/monitors">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" data-testid="button-manage-monitors">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              <div className="text-left">
                <p className="font-semibold">Manage Monitors</p>
                <p className="text-xs text-muted-foreground">Add or remove websites</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/alerts">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" data-testid="button-configure-alerts">
              <span className="material-symbols-outlined text-chart-3">notifications</span>
              <div className="text-left">
                <p className="font-semibold">Configure Alerts</p>
                <p className="text-xs text-muted-foreground">Set up email notifications</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/logs">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" data-testid="button-view-logs">
              <span className="material-symbols-outlined text-chart-4">receipt_long</span>
              <div className="text-left">
                <p className="font-semibold">View Logs</p>
                <p className="text-xs text-muted-foreground">Check uptime history</p>
              </div>
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" data-testid="button-export-data">
            <span className="material-symbols-outlined text-muted-foreground">download</span>
            <div className="text-left">
              <p className="font-semibold">Export Data</p>
              <p className="text-xs text-muted-foreground">Download logs as CSV</p>
            </div>
          </Button>
        </div>
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">ecg_heart</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">PulseWatch</h3>
            <p className="text-muted-foreground text-sm">
              Version 1.0.0 - Uptime Monitoring Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
