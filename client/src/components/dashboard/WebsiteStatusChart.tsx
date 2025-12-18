import { Pie, PieChart, Cell, Label } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Log, Website } from "@shared/schema";

interface WebsiteStatusChartProps {
  websites: Website[];
  logs: Log[];
  isLoading?: boolean;
}

const chartConfig = {
  up: { label: "Operational", color: "hsl(var(--chart-1))" },
  down: { label: "Down", color: "hsl(var(--chart-4))" },
  paused: { label: "Paused", color: "hsl(var(--chart-3))" },
  unknown: { label: "No Data", color: "hsl(var(--muted-foreground))" },
} as const;

type ChartKey = keyof typeof chartConfig;

const safeDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export function WebsiteStatusChart({ websites, logs, isLoading }: WebsiteStatusChartProps) {
  const latestLogByWebsite = logs.reduce<Map<number, Log>>((acc, log) => {
    const existing = acc.get(log.websiteId);
    const existingTime = existing ? safeDate(existing.createdAt)?.getTime() ?? 0 : 0;
    const currentTime = safeDate(log.createdAt)?.getTime() ?? 0;

    if (!existing || currentTime > existingTime) {
      acc.set(log.websiteId, log);
    }
    return acc;
  }, new Map());

  const counts = websites.reduce<Record<ChartKey, number>>(
    (acc, website) => {
      if (!website.enabled) {
        acc.paused += 1;
        return acc;
      }

      const latest = latestLogByWebsite.get(website.id);
      if (!latest) {
        acc.unknown += 1;
        return acc;
      }

      if (latest.status === "UP") {
        acc.up += 1;
      } else {
        acc.down += 1;
      }
      return acc;
    },
    { up: 0, down: 0, paused: 0, unknown: 0 }
  );

  const chartData = (Object.keys(chartConfig) as ChartKey[]).map((key) => ({
    key,
    label: chartConfig[key].label,
    count: counts[key],
  }));

  const hasData = chartData.some((item) => item.count > 0);

  const total = websites.length || 1;

  return (
    <div
      className="p-6 md:p-8 rounded-4xl bg-card border border-foreground/5 flex flex-col gap-6"
      data-testid="chart-status-breakdown"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">Status Breakdown</h3>
          <p className="text-muted-foreground text-sm">By latest monitor result</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground animate-pulse">
          Loading status data...
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-70">add_chart</span>
          <p>Add monitors to see status distribution</p>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-70">schedule</span>
          <p>Waiting for the first checks to complete</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-[380px]"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={64}
                outerRadius={96}
                paddingAngle={4}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.key}
                    fill={`var(--color-${item.key})`}
                    className="drop-shadow-sm"
                  />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      typeof viewBox.cx !== "number" ||
                      typeof viewBox.cy !== "number"
                    ) {
                      return null;
                    }

                    return (
                      <g>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy - 4}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="hsl(var(--foreground))"
                          fontSize={22}
                          fontWeight={800}
                        >
                          {websites.length}
                        </text>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy + 14}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="hsl(var(--muted-foreground))"
                          fontSize={12}
                          fontWeight={600}
                        >
                          monitors
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
              <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="label" />} />
            </PieChart>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-3">
            {chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/5 px-3 py-2.5"
              >
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: `var(--color-${item.key})` }}
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} / {total} • {Math.round((item.count / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
