import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UptimeLog } from "@shared/schema";

interface ResponseTimeChartProps {
  logs: UptimeLog[];
  isLoading?: boolean;
}

type TimeRange = "1H" | "24H" | "7D";

export function ResponseTimeChart({ logs, isLoading }: ResponseTimeChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1H");

  const filterLogsByTimeRange = (range: TimeRange) => {
    const now = new Date();
    let cutoff: Date;
    
    switch (range) {
      case "1H":
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24H":
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7D":
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return logs
      .filter(log => new Date(log.checkedAt) >= cutoff)
      .sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
  };

  const filteredLogs = filterLogsByTimeRange(timeRange);

  const generatePath = () => {
    if (filteredLogs.length < 2) {
      return { line: "", area: "" };
    }

    const maxResponse = Math.max(...filteredLogs.map(l => l.responseTime || 0), 500);
    const minResponse = 0;
    const range = maxResponse - minResponse || 1;

    const points = filteredLogs.map((log, index) => {
      const x = (index / (filteredLogs.length - 1)) * 500;
      const y = 150 - ((((log.responseTime || 0) - minResponse) / range) * 130);
      return { x, y };
    });

    const linePoints = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPoints = `${linePoints} L500,150 L0,150 Z`;

    return { line: linePoints, area: areaPoints };
  };

  const { line, area } = generatePath();

  const getTimeLabels = () => {
    switch (timeRange) {
      case "1H":
        return ["60m ago", "45m ago", "30m ago", "15m ago", "Now"];
      case "24H":
        return ["24h ago", "18h ago", "12h ago", "6h ago", "Now"];
      case "7D":
        return ["7d ago", "5d ago", "3d ago", "1d ago", "Now"];
    }
  };

  return (
    <div 
      className="lg:col-span-2 p-6 md:p-8 rounded-4xl bg-card border border-foreground/5 flex flex-col"
      data-testid="chart-response-time"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold mb-1">Response Time Trends</h3>
          <p className="text-muted-foreground text-sm">
            {timeRange === "1H" ? "Last 60 minutes" : timeRange === "24H" ? "Last 24 hours" : "Last 7 days"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-full">
          {(["1H", "24H", "7D"] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? "default" : "ghost"}
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                timeRange === range 
                  ? "" 
                  : "text-muted-foreground"
              }`}
              onClick={() => setTimeRange(range)}
              data-testid={`button-range-${range.toLowerCase()}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full h-64 relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        ) : filteredLogs.length < 2 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">show_chart</span>
              <p>Not enough data to display chart</p>
              <p className="text-sm mt-1">Add monitors to start collecting data</p>
            </div>
          </div>
        ) : (
          <svg 
            className="w-full h-full overflow-visible" 
            viewBox="0 0 500 150" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(109 90% 50%)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(109 90% 50%)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <path d={area} fill="url(#chartGradient)" />
            
            <path 
              d={line} 
              fill="none" 
              stroke="hsl(109 90% 50%)" 
              strokeWidth="3" 
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            
            {filteredLogs.length > 0 && (
              <circle
                cx="500"
                cy={150 - (((filteredLogs[filteredLogs.length - 1]?.responseTime || 0) / Math.max(...filteredLogs.map(l => l.responseTime || 0), 500)) * 130)}
                r="6"
                fill="hsl(var(--background))"
                stroke="hsl(109 90% 50%)"
                strokeWidth="3"
                className="cursor-pointer"
              />
            )}
          </svg>
        )}
        
        <div className="flex justify-between mt-4 text-xs text-muted-foreground font-medium">
          {getTimeLabels().map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
