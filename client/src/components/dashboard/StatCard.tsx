interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  suffix?: string;
  variant?: "default" | "success" | "danger" | "info";
}

const variantStyles = {
  default: {
    iconBg: "bg-foreground/10",
    iconColor: "text-foreground",
    valueColor: "text-foreground",
    glowColor: "bg-foreground/5",
    glowHover: "group-hover:bg-foreground/10",
  },
  success: {
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    valueColor: "text-primary",
    glowColor: "bg-primary/10",
    glowHover: "group-hover:bg-primary/20",
  },
  danger: {
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
    valueColor: "text-destructive",
    glowColor: "bg-destructive/10",
    glowHover: "group-hover:bg-destructive/20",
  },
  info: {
    iconBg: "bg-chart-3/20",
    iconColor: "text-chart-3",
    valueColor: "text-foreground",
    glowColor: "bg-chart-3/10",
    glowHover: "group-hover:bg-chart-3/20",
  },
};

export function StatCard({ icon, label, value, suffix, variant = "default" }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div 
      className="flex flex-col p-6 rounded-4xl bg-card border border-foreground/5 relative overflow-hidden group transition-all"
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div 
        className={`absolute right-[-20px] top-[-20px] size-32 rounded-full ${styles.glowColor} ${styles.glowHover} blur-3xl transition-colors`}
      />
      
      <div className="flex items-center gap-3 mb-4 z-10">
        <div className={`size-10 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-muted-foreground font-medium">{label}</p>
      </div>
      
      <p className={`text-4xl font-bold ${styles.valueColor} tracking-tight z-10`}>
        {value}
        {suffix && (
          <span className="text-xl text-muted-foreground ml-1 font-medium">{suffix}</span>
        )}
      </p>
    </div>
  );
}
