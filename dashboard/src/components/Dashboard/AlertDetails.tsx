import { AlertTriangle, User, Clock, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface AlertDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
  alertType?: 'red' | 'blue';
}

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

export function AlertDetails({ open, onOpenChange, alunoId, alertType }: AlertDetailsProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["alertLogs", alunoId, alertType],
    queryFn: () => (alunoId && alertType ? api.getAlertLogs(alunoId, alertType) : Promise.resolve([])),
    enabled: open && !!alunoId && !!alertType,
  });
  const alertTitle = alertType === 'blue' ? 'Uso de IA' : 'Alertas de Acesso';
  const alertIcon = alertType === 'blue' ? 'success' : 'warning';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${alertType === 'blue' ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'} border`}>
                <AlertTriangle className={`w-5 h-5 ${alertType === 'blue' ? 'text-success' : 'text-warning'}`} />
              </div>
              <DialogTitle className="text-2xl">{alertTitle}</DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={alertType === 'blue' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                {isLoading ? "..." : logs.length} logs
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Logs de atividade do aluno
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)]">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.log_id}
                  className="p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold">{log.student_name}</h3>
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(log.categoria)}
                          >
                            {log.categoria}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-primary hover:underline cursor-pointer"
                              onClick={() => window.open(log.url.startsWith('http') ? log.url : `https://${log.url}`, '_blank')}
                            >
                              {log.url}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">
                              {log.duration}s
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-border/50 bg-muted/20">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total de {logs.length} logs encontrados
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
