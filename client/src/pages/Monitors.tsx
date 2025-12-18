import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { AddMonitorModal } from "@/components/monitors/AddMonitorModal";
import { BulkAddModal } from "@/components/monitors/BulkAddModal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Website, Log } from "@shared/schema";

export default function Monitors() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    refetchInterval: 30000,
  });

  const { data: logs = [] } = useQuery<Log[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 30000,
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

  const bulkAddMutation = useMutation({
    mutationFn: async (monitors: { name: string; url: string; frequency: number }[]) => {
      return apiRequest("POST", "/api/websites/bulk", { websites: monitors });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setBulkModalOpen(false);
      toast({
        title: "Monitors added",
        description: "Your websites are now being monitored.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add monitors",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/websites/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update monitor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/websites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Monitor deleted",
        description: "The monitor has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete monitor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredWebsites = websites.filter(
    (website) =>
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            data-testid="text-page-title"
          >
            Monitors
          </h2>
          <p className="text-muted-foreground text-base">
            Manage your website monitors
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setBulkModalOpen(true)}
            data-testid="button-bulk-add"
          >
            <span className="material-symbols-outlined mr-2" style={{ fontSize: "18px" }}>
              playlist_add
            </span>
            Bulk Add
          </Button>
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

      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          search
        </span>
        <Input
          placeholder="Search monitors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
          data-testid="input-search-monitors"
        />
      </div>

      {websitesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading monitors...</div>
        </div>
      ) : filteredWebsites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">monitoring</span>
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchQuery ? "No monitors found" : "No monitors yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery
              ? "Try a different search term"
              : "Add your first monitor to start tracking uptime and performance"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="glow-primary"
              data-testid="button-add-first-monitor"
            >
              <span className="material-symbols-outlined mr-2" style={{ fontSize: "20px" }}>add</span>
              Add Your First Monitor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWebsites.map((website) => (
            <MonitorCard
              key={website.id}
              website={website}
              logs={logs}
              onToggle={(id, isActive) => toggleMutation.mutate({ id, isActive })}
              onDelete={(id) => deleteMutation.mutate(id)}
              onClick={() => {}}
            />
          ))}
        </div>
      )}

      <AddMonitorModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={(data) => addMutation.mutate(data)}
        isPending={addMutation.isPending}
      />

      <BulkAddModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        onSubmit={(monitors) => bulkAddMutation.mutate(monitors)}
        isPending={bulkAddMutation.isPending}
      />
    </div>
  );
}
