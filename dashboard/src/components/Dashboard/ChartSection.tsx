import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilters } from "@/contexts/FilterContext";

const COLORS = ["hsl(217 91% 60%)", "hsl(280 80% 55%)", "hsl(340 85% 55%)", "hsl(142 70% 45%)", "hsl(38 92% 50%)"];

type ChartType = "bar" | "pie" | "line" | "donut" | "polar";

export const ChartSection = () => {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const { data, isLoading } = useDashboardData();
  const { category, alertsOnly } = useFilters();

  const chartData = useMemo(() => {
    if (!data?.logs) return [];

    // Filtrar logs
    const filteredLogs = data.logs.filter((log) => {
      const matchesCategory = category === "all" || log.categoria === category;
      const matchesAlerts = !alertsOnly || log.categoria === "IA" || log.categoria === "Rede Social";
      return matchesCategory && matchesAlerts;
    });

    // Agrupar por URL e somar durações
    const urlMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const current = urlMap.get(log.url) || 0;
      urlMap.set(log.url, current + log.duration);
    });

    // Converter para array e ordenar
    const sorted = Array.from(urlMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    return sorted;
  }, [data?.logs, category, alertsOnly]);

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Carregando dados...
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível para exibir.
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={chartType === "donut" ? 100 : 120}
                innerRadius={chartType === "donut" ? 60 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "polar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
              <Radar name="Acessos" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </RadarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Análise Visual (Top 10 Sites)</h2>
        <div className="flex gap-2">
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            onClick={() => setChartType("bar")}
            size="sm"
          >
            Barras
          </Button>
          <Button
            variant={chartType === "pie" ? "default" : "outline"}
            onClick={() => setChartType("pie")}
            size="sm"
          >
            Pizza
          </Button>
          <Button
            variant={chartType === "donut" ? "default" : "outline"}
            onClick={() => setChartType("donut")}
            size="sm"
          >
            Rosca
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            onClick={() => setChartType("line")}
            size="sm"
          >
            Linha
          </Button>
          <Button
            variant={chartType === "polar" ? "default" : "outline"}
            onClick={() => setChartType("polar")}
            size="sm"
          >
            Área Polar
          </Button>
        </div>
      </div>
      <div className="w-full">
        {renderChart()}
      </div>
    </Card>
  );
};
