import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (urls: { name: string; url: string; frequency: number }[]) => void;
  isPending?: boolean;
}

export function BulkAddModal({ open, onOpenChange, onSubmit, isPending }: BulkAddModalProps) {
  const [urls, setUrls] = useState("");
  const [frequency, setFrequency] = useState("5");

  const handleSubmit = () => {
    const urlList = urls
      .split(/[\n,]/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const monitors = urlList.map(url => {
      let cleanUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        cleanUrl = `https://${url}`;
      }

      try {
        const urlObj = new URL(cleanUrl);
        return {
          name: urlObj.hostname,
          url: cleanUrl,
          frequency: parseInt(frequency),
        };
      } catch {
        return null;
      }
    }).filter((m): m is { name: string; url: string; frequency: number } => m !== null);

    if (monitors.length > 0) {
      onSubmit(monitors);
      setUrls("");
    }
  };

  const urlCount = urls
    .split(/[\n,]/)
    .map(u => u.trim())
    .filter(u => u.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-bulk-add">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">playlist_add</span>
            Bulk Add Monitors
          </DialogTitle>
          <DialogDescription>
            Add multiple websites at once. Enter URLs separated by commas or new lines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>URLs</Label>
            <Textarea
              placeholder="https://example.com&#10;https://another-site.com&#10;google.com"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-[150px] resize-none"
              data-testid="textarea-bulk-urls"
            />
            {urlCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {urlCount} URL{urlCount !== 1 ? "s" : ""} detected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Check Frequency (for all)</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger data-testid="select-bulk-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 minute</SelectItem>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="10">Every 10 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every 60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-bulk"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isPending || urlCount === 0}
              className="glow-primary"
              data-testid="button-submit-bulk"
            >
              {isPending ? "Adding..." : `Add ${urlCount} Monitor${urlCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
