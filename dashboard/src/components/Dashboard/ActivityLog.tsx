import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilters } from "@/contexts/FilterContext";
import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "IA": "bg-success/20 text-success border-success/30",
    "Rede Social": "bg-accent/20 text-accent border-accent/30",
    "Streaming & Jogos": "bg-warning/20 text-warning border-warning/30",
    "Educacional": "bg-primary/20 text-primary border-primary/30",
    "Outros": "bg-muted/20 text-muted-foreground border-muted/30",
  };
  return colors[category] || "bg-muted/20 text-muted-foreground border-muted/30";
};

export const ActivityLog = () => {
  const { data, isLoading } = useDashboardData();
  const { searchTerm, category, alertsOnly } = useFilters();

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    
    return data.logs.filter((log) => {
      const matchesSearch = 
        searchTerm === "" ||
        log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.aluno_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === "all" || log.categoria === category;
      
      const matchesAlerts = 
        !alertsOnly || 
        log.categoria === "IA" || 
        log.categoria === "Rede Social";
      
      return matchesSearch && matchesCategory && matchesAlerts;
    });
  }, [data?.logs, searchTerm, category, alertsOnly]);

  const handleUrlClick = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <h2 className="text-2xl font-bold mb-6">
        Logs de Atividade ({isLoading ? "..." : filteredLogs.length})
      </h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">ALUNO</TableHead>
              <TableHead className="font-semibold">URL</TableHead>
              <TableHead className="font-semibold">DURAÇÃO (S)</TableHead>
              <TableHead className="font-semibold">CATEGORIA</TableHead>
              <TableHead className="font-semibold">DATA E HORA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Carregando logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum log encontrado para a seleção atual.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.log_id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{log.student_name}</TableCell>
                  <TableCell 
                    className="text-primary cursor-pointer hover:underline flex items-center gap-1"
                    onClick={() => handleUrlClick(log.url)}
                  >
                    {log.url}
                    <ExternalLink className="w-3 h-3" />
                  </TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryColor(log.categoria)} border`}>
                      {log.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
