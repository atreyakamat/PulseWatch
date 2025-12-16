import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { AlertEmail } from "@shared/schema";

const addEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AddEmailFormData = z.infer<typeof addEmailSchema>;

interface EmailSettingsProps {
  emails: AlertEmail[];
  onAdd: (email: string) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
  onDelete: (id: string) => void;
  isAddingPending?: boolean;
  isLoading?: boolean;
}

export function EmailSettings({
  emails,
  onAdd,
  onToggle,
  onDelete,
  isAddingPending,
  isLoading,
}: EmailSettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<AddEmailFormData>({
    resolver: zodResolver(addEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (data: AddEmailFormData) => {
    onAdd(data.email);
    form.reset();
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" data-testid="settings-email">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Alert Emails</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Get notified when your monitors go down
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "ghost" : "default"}
          className={showAddForm ? "" : "glow-primary"}
          data-testid="button-add-email"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <span className="material-symbols-outlined mr-2" style={{ fontSize: "18px" }}>
                add
              </span>
              Add Email
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-3 p-4 rounded-2xl bg-foreground/5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="alert@example.com"
                      {...field}
                      data-testid="input-alert-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isAddingPending} data-testid="button-submit-email">
              {isAddingPending ? "Adding..." : "Add"}
            </Button>
          </form>
        </Form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading emails...</div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-foreground/5">
            <span className="material-symbols-outlined text-4xl text-muted-foreground/50 mb-3">
              mail
            </span>
            <p className="text-muted-foreground">No alert emails configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an email to receive downtime alerts
            </p>
          </div>
        ) : (
          emails.map((emailConfig) => (
            <div
              key={emailConfig.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5"
              data-testid={`email-item-${emailConfig.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground">mail</span>
                <span className="font-medium">{emailConfig.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={emailConfig.isEnabled}
                  onCheckedChange={(checked) => onToggle(emailConfig.id, checked)}
                  data-testid={`switch-email-${emailConfig.id}`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => onDelete(emailConfig.id)}
                  data-testid={`button-delete-email-${emailConfig.id}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    delete
                  </span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
