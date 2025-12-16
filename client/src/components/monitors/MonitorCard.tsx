import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Website, UptimeLog } from "@shared/schema";

interface MonitorCardProps {
  website: Website;
  logs: UptimeLog[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function MonitorCard({ website, logs, onToggle, onDelete, onClick }: MonitorCardProps) {
  const recentLogs = logs
    .filter(log => log.websiteId === website.id)
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
    .slice(0, 30);

  const latestLog = recentLogs[0];
  const isUp = latestLog?.status === "UP";
  const hasLogs = recentLogs.length > 0;

  const uptimePercentage = recentLogs.length > 0
    ? ((recentLogs.filter(l => l.status === "UP").length / recentLogs.length) * 100).toFixed(1)
    : "N/A";

  const avgResponseTime = recentLogs.length > 0
    ? Math.round(
        recentLogs
          .filter(l => l.responseTime)
          .reduce((sum, l) => sum + (l.responseTime || 0), 0) / 
        Math.max(recentLogs.filter(l => l.responseTime).length, 1)
      )
    : null;

  const statusBars = Array.from({ length: 30 }, (_, i) => {
    const log = recentLogs[29 - i];
    if (!log) return "empty";
    return log.status === "UP" ? "up" : "down";
  });

  return (
    <div 
      className="p-6 rounded-4xl bg-card border border-foreground/5 hover-elevate transition-all cursor-pointer"
      onClick={onClick}
      data-testid={`monitor-card-${website.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-lg truncate" data-testid={`text-monitor-name-${website.id}`}>
              {website.name}
            </h3>
            <Badge 
              variant={!hasLogs ? "secondary" : isUp ? "default" : "destructive"}
              className={!hasLogs ? "" : isUp ? "bg-primary/20 text-primary border-primary/30" : ""}
              data-testid={`badge-status-${website.id}`}
            >
              {!hasLogs ? "Pending" : isUp ? "UP" : "DOWN"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm truncate" data-testid={`text-monitor-url-${website.id}`}>
            {website.url}
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={website.isActive}
            onCheckedChange={(checked) => onToggle(website.id, checked)}
            data-testid={`switch-monitor-${website.id}`}
          />
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(website.id);
            }}
            data-testid={`button-delete-${website.id}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 h-8" data-testid={`status-bars-${website.id}`}>
        {statusBars.map((status, i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-sm transition-colors ${
              status === "empty" 
                ? "bg-foreground/5" 
                : status === "up" 
                  ? "bg-primary/60" 
                  : "bg-destructive/60"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Uptime:</span>
          <span className={`font-semibold ${
            uptimePercentage === "N/A" 
              ? "text-muted-foreground" 
              : parseFloat(uptimePercentage) >= 99 
                ? "text-primary" 
                : parseFloat(uptimePercentage) >= 95 
                  ? "text-chart-4" 
                  : "text-destructive"
          }`}>
            {uptimePercentage === "N/A" ? "N/A" : `${uptimePercentage}%`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Response:</span>
          <span className="font-semibold">
            {avgResponseTime !== null ? `${avgResponseTime}ms` : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Check:</span>
          <span className="font-semibold">{website.frequency}m</span>
        </div>
      </div>
    </div>
  );
}
