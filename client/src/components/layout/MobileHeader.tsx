import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-foreground/10 bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">ecg_heart</span>
        <h1 className="text-lg font-bold" data-testid="text-mobile-title">PulseWatch</h1>
      </div>
      <SidebarTrigger data-testid="button-mobile-menu" />
    </div>
  );
}
