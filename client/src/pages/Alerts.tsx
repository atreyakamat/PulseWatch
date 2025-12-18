import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EmailSettings } from "@/components/settings/EmailSettings";
import type { AlertEmail } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AlertHistory {
  id: number;
  websiteName: string;
  status: "UP" | "DOWN";
  title: string;
  message: string;
  sentAt: string;
}

export default function Alerts() {
  const { toast } = useToast();

  const { data: emails = [], isLoading: isLoadingEmails } = useQuery<AlertEmail[]>({
    queryKey: ["/api/alerts/emails"],
    refetchInterval: 30000,
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery<AlertHistory[]>({
    queryKey: ["/api/alerts/recent"],
    refetchInterval: 10000,
  });

  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/alerts/emails", { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/emails"] });
      toast({
        title: "Email added",
        description: "You will now receive alerts at this email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleEmailMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      return apiRequest("PATCH", `/api/alerts/emails/${id}`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/emails"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/alerts/emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/emails"] });
      toast({
        title: "Email removed",
        description: "You will no longer receive alerts at this email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Alerts</h2>
        <p className="text-muted-foreground text-base">Recent notifications sent via KudoKonnect</p>
      </div>

      <div className="grid gap-4">
        {isLoadingAlerts ? (
          <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No alerts sent yet.</div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: alert.status === "DOWN" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {alert.title}
                </CardTitle>
                <Badge variant={alert.status === "UP" ? "default" : "destructive"}>
                  {alert.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-2 rounded mt-2">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  Sent at: {format(new Date(alert.sentAt), "PPpp")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 p-6 md:p-8">
        <EmailSettings
          emails={emails}
          onAdd={(email) => addEmailMutation.mutate(email)}
          onToggle={(id, isEnabled) => toggleEmailMutation.mutate({ id, isEnabled })}
          onDelete={(id) => deleteEmailMutation.mutate(id)}
          isAddingPending={addEmailMutation.isPending}
          isLoading={isLoadingEmails}
        />
      </div>

      <div className="rounded-4xl bg-card border border-foreground/5 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-full bg-chart-3/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-chart-3">info</span>
          </div>
          <div>
            <h3 className="font-bold mb-1">How Alerts Work</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              When a monitored website goes down, all enabled email addresses will receive a 
              notification. To prevent spam, there's a 5-minute cooldown between alerts for 
              the same website. You'll also receive a recovery notification when the site 
              comes back online.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
