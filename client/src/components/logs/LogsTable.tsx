import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { UptimeLog, Website } from "@shared/schema";

interface LogsTableProps {
  logs: UptimeLog[];
  websites: Website[];
  isLoading?: boolean;
}

export function LogsTable({ logs, websites, isLoading }: LogsTableProps) {
  const getWebsiteName = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId);
    return website?.name || "Unknown";
  };

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading logs...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-4">
          receipt_long
        </span>
        <h3 className="text-lg font-semibold mb-2">No logs yet</h3>
        <p className="text-muted-foreground">
          Logs will appear here once monitoring starts
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="table-logs">
      <table className="w-full">
        <thead>
          <tr className="border-b border-foreground/10">
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Website
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Status
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Response Time
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Status Code
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Checked At
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Error
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLogs.map((log) => (
            <tr 
              key={log.id} 
              className="border-b border-foreground/5 hover-elevate"
              data-testid={`log-row-${log.id}`}
            >
              <td className="py-4 px-4">
                <span className="font-medium">{getWebsiteName(log.websiteId)}</span>
              </td>
              <td className="py-4 px-4">
                <Badge 
                  variant={log.status === "UP" ? "default" : "destructive"}
                  className={log.status === "UP" ? "bg-primary/20 text-primary border-primary/30" : ""}
                >
                  {log.status}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <span className={log.responseTime && log.responseTime > 1000 ? "text-chart-4" : ""}>
                  {log.responseTime ? `${Math.round(log.responseTime)}ms` : "—"}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={
                  !log.statusCode ? "text-muted-foreground" :
                  log.statusCode >= 200 && log.statusCode < 300 ? "text-primary" :
                  log.statusCode >= 400 ? "text-destructive" : ""
                }>
                  {log.statusCode || "—"}
                </span>
              </td>
              <td className="py-4 px-4 text-muted-foreground text-sm">
                {format(new Date(log.checkedAt), "MMM d, yyyy HH:mm:ss")}
              </td>
              <td className="py-4 px-4">
                {log.errorMessage ? (
                  <span className="text-destructive text-sm truncate max-w-[200px] block">
                    {log.errorMessage}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
