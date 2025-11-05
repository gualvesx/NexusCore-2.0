import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilters } from "@/contexts/FilterContext";
import { useMemo, useState } from "react";
import { AlertDetails } from "./AlertDetails";

export const UserSummary = () => {
  const { data, isLoading } = useDashboardData();
  const { searchTerm } = useFilters();
  const [selectedAlert, setSelectedAlert] = useState<{ alunoId: string; type: 'red' | 'blue' } | null>(null);

  const filteredUsers = useMemo(() => {
    if (!data?.summary) return [];
    
    return data.summary.filter((user) => {
      if (searchTerm === "") return true;
      
      return (
        user.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.aluno_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.pc_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data?.summary, searchTerm]);

  const handleAlertClick = (alunoId: string, hasBlue: boolean, hasRed: boolean) => {
    // Prioriza alerta vermelho se existir
    if (hasRed) {
      setSelectedAlert({ alunoId, type: 'red' });
    } else if (hasBlue) {
      setSelectedAlert({ alunoId, type: 'blue' });
    }
  };

  return (
    <>
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
        <h2 className="text-2xl font-bold mb-6">Resumo de Atividade</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">STATUS</TableHead>
                <TableHead className="font-semibold">NOME DO ALUNO</TableHead>
                <TableHead className="font-semibold">ID BRUTO</TableHead>
                <TableHead className="font-semibold">TEMPO TOTAL (MIN)</TableHead>
                <TableHead className="font-semibold">REGISTROS</TableHead>
                <TableHead className="font-semibold">ÚLTIMA ATIVIDADE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Carregando dados...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum aluno encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.student_db_id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex gap-2">
                        {user.has_blue_alert && (
                          <Badge 
                            variant="outline" 
                            className="bg-success/20 text-success border-success/30 cursor-pointer hover:bg-success/30 transition-colors"
                            onClick={() => handleAlertClick(user.aluno_id, true, false)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            IA
                          </Badge>
                        )}
                        {user.has_red_alert && (
                          <Badge 
                            variant="outline" 
                            className="bg-accent/20 text-accent border-accent/30 cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => handleAlertClick(user.aluno_id, false, true)}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Alerta
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{user.student_name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.aluno_id}</TableCell>
                    <TableCell>{(user.total_duration / 60).toFixed(1)}</TableCell>
                    <TableCell>{user.log_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.last_activity ? new Date(user.last_activity).toLocaleString('pt-BR') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDetails 
        open={!!selectedAlert} 
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        alunoId={selectedAlert?.alunoId}
        alertType={selectedAlert?.type}
      />
    </>
  );
};
