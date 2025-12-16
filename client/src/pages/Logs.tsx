import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogsTable } from "@/components/logs/LogsTable";
import type { Website, UptimeLog } from "@shared/schema";

export default function Logs() {
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    refetchInterval: 30000,
  });

  const { data: logs = [], isLoading } = useQuery<UptimeLog[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 30000,
  });

  const filteredLogs = logs.filter((log) => {
    if (selectedWebsite !== "all" && log.websiteId !== selectedWebsite) {
      return false;
    }
    if (statusFilter !== "all" && log.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedWebsite("all");
    setStatusFilter("all");
  };

  const hasFilters = selectedWebsite !== "all" || statusFilter !== "all";

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            data-testid="text-page-title"
          >
            Logs
          </h2>
          <p className="text-muted-foreground text-base">
            View all uptime check logs
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
          <SelectTrigger className="w-[200px]" data-testid="select-website-filter">
            <SelectValue placeholder="All Websites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Websites</SelectItem>
            {websites.map((website) => (
              <SelectItem key={website.id} value={website.id}>
                {website.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="UP">UP</SelectItem>
            <SelectItem value="DOWN">DOWN</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
            <span className="material-symbols-outlined mr-2" style={{ fontSize: "18px" }}>
              filter_alt_off
            </span>
            Clear Filters
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 overflow-hidden">
        <LogsTable logs={filteredLogs} websites={websites} isLoading={isLoading} />
      </div>
    </div>
  );
}
