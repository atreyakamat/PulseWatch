import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Log, Website } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface IncidentsPanelProps {
  logs: Log[];
  websites: Website[];
  isLoading?: boolean;
}

export function IncidentsPanel({ logs, websites, isLoading }: IncidentsPanelProps) {
  const safeDate = (value: string | Date | null | undefined) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const incidents = logs
    .filter((log) => log.status === "DOWN")
    .sort((a, b) => (safeDate(b.createdAt)?.getTime() ?? 0) - (safeDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 10);

  const getWebsiteName = (websiteId: number) => {
    const website = websites.find(w => w.id === websiteId);
    return website?.name || website?.url || "Unknown";
  };

  const getWebsiteUrl = (websiteId: number) => {
    const website = websites.find(w => w.id === websiteId);
    return website?.url || "";
  };

  return (
    <div 
      className="flex flex-col p-6 md:p-8 rounded-4xl bg-card border border-foreground/5"
      data-testid="panel-incidents"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Recent Incidents</h3>
        <Link href="/logs">
          <Button variant="link" className="text-primary text-sm font-bold p-0" data-testid="link-view-all-incidents">
            View All
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading incidents...</div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-primary/50 mb-2">
              verified
            </span>
            <p className="text-muted-foreground">No incidents detected</p>
            <p className="text-sm text-muted-foreground mt-1">All systems operational</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex gap-4 items-start p-3 rounded-xl bg-foreground/5 hover-elevate transition-colors cursor-pointer"
              data-testid={`incident-item-${incident.id}`}
            >
              <div className="mt-1.5 min-w-2 size-2 rounded-full bg-destructive pulse-dot" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium text-sm truncate">
                    {incident.errorMessage || "Connection Failed"}
                  </p>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {safeDate(incident.createdAt)
                      ? formatDistanceToNow(safeDate(incident.createdAt)!, { addSuffix: true })
                      : "Unknown time"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs truncate">
                  {getWebsiteName(incident.websiteId)}
                </p>
                <p className="text-muted-foreground/60 text-xs truncate">
                  {getWebsiteUrl(incident.websiteId)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
