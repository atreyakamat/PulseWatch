import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { IncidentsPanel } from "@/components/dashboard/IncidentsPanel";
import { WebsiteStatusChart } from "@/components/dashboard/WebsiteStatusChart";
import { AddMonitorModal } from "@/components/monitors/AddMonitorModal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Website, Log } from "@shared/schema";

export default function Dashboard() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const safeDate = (value: string | Date | null | undefined) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<Log[]>({
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

  const getLatestStatus = (websiteId: number) => {
    const websiteLogs = logs
      .filter(log => log.websiteId === websiteId)
      .sort((a, b) => (safeDate(b.createdAt)?.getTime() ?? 0) - (safeDate(a.createdAt)?.getTime() ?? 0));
    return websiteLogs[0]?.status;
  };

  const totalMonitors = websites.length;
  const operational = websites.filter(w => w.enabled && getLatestStatus(w.id) === "UP").length;
  const down = websites.filter(w => w.enabled && getLatestStatus(w.id) === "DOWN").length;

  const recentLogs = logs.filter(log => {
    const logTime = safeDate(log.createdAt);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return (logTime && logTime >= hourAgo && log.responseTime) || false;
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <ResponseTimeChart logs={logs} isLoading={logsLoading} className="xl:col-span-3" />
        {/* <WebsiteStatusChart logs={logs} websites={websites} isLoading={websitesLoading || logsLoading} /> */}
        <div className="xl:col-span-1">
          <IncidentsPanel logs={logs} websites={websites} isLoading={logsLoading} />
        </div>
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
