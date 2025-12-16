import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { IncidentsPanel } from "@/components/dashboard/IncidentsPanel";
import { AddMonitorModal } from "@/components/monitors/AddMonitorModal";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Website, UptimeLog } from "@shared/schema";

export default function Dashboard() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: websites = [], isLoading: websitesLoading, error: websitesError } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: logs = [], isLoading: logsLoading, error: logsError } = useQuery<UptimeLog[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; url: string; frequency: number }) => {
      return apiRequest("POST", "/api/websites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setAddModalOpen(false);
      toast({
        title: "Monitor added",
        description: "Your website is now being monitored.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add monitor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getLatestStatus = (websiteId: string) => {
    const websiteLogs = logs
      .filter(log => log.websiteId === websiteId)
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
    return websiteLogs[0]?.status;
  };

  const totalMonitors = websites.length;
  const operational = websites.filter(w => w.isActive && getLatestStatus(w.id) === "UP").length;
  const down = websites.filter(w => w.isActive && getLatestStatus(w.id) === "DOWN").length;

  const recentLogs = logs.filter(log => {
    const logTime = new Date(log.checkedAt);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return logTime >= hourAgo && log.responseTime;
  });

  const avgResponseTime = recentLogs.length > 0
    ? Math.round(
        recentLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / recentLogs.length
      )
    : 0;

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            data-testid="text-page-title"
          >
            System Overview
          </h2>
          <p className="text-muted-foreground text-base">
            Real-time server health and metrics
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setAddModalOpen(true)}
            className="glow-primary"
            data-testid="button-add-monitor"
          >
            <span className="material-symbols-outlined mr-2" style={{ fontSize: "20px" }}>add</span>
            Add Monitor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="dns"
          label="Total Monitors"
          value={websitesLoading ? "—" : totalMonitors}
          variant="default"
        />
        <StatCard
          icon="check_circle"
          label="Operational"
          value={websitesLoading || logsLoading ? "—" : operational}
          variant="success"
        />
        <StatCard
          icon="warning"
          label="Systems Down"
          value={websitesLoading || logsLoading ? "—" : down}
          variant="danger"
        />
        <StatCard
          icon="speed"
          label="Avg Response"
          value={logsLoading ? "—" : avgResponseTime}
          suffix="ms"
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResponseTimeChart logs={logs} isLoading={logsLoading} />
        <IncidentsPanel logs={logs} websites={websites} isLoading={logsLoading} />
      </div>

      <AddMonitorModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={(data) => addMutation.mutate(data)}
        isPending={addMutation.isPending}
      />
    </div>
  );
}
