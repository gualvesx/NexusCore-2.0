import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Class } from "@/services/api";
import { toast } from "sonner";
import { useClassMembers, useProfessors } from "@/hooks/useDashboardData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageLeadersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
}

export const ManageLeadersDialog = ({ open, onOpenChange, classData }: ManageLeadersDialogProps) => {
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const queryClient = useQueryClient();

  const { data: allLeaders = [] } = useProfessors();
  const { data: membersData } = useClassMembers(classData?.id || null);

  const classMembers = membersData?.members || [];
  const isCurrentUserOwner = membersData?.isCurrentUserOwner || false;

  const shareMutation = useMutation({
    mutationFn: (leaderId: string) => api.shareClass(classData!.id!, leaderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classMembers", classData?.id] });
      toast.success("Líder adicionado com sucesso!");
      setSelectedLeaderId("");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (leaderId: string) => api.removeClassMember(classData!.id!, leaderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classMembers", classData?.id] });
      toast.success("Líder removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleShare = () => {
    if (selectedLeaderId) {
      shareMutation.mutate(selectedLeaderId);
    }
  };

  // Filtrar líderes que não estão na equipe
  const availableLeaders = allLeaders.filter(
    (p) => !classMembers.find((m) => m.id === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-arvo">Gerenciar Líderes - {classData?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar Líder */}
          {isCurrentUserOwner && (
            <div className="space-y-2">
              <Label>Compartilhar Equipe com Líder</Label>
              <div className="flex gap-2">
                <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.full_name} ({leader.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleShare} disabled={!selectedLeaderId || shareMutation.isPending}>
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de Líderes */}
          <div className="space-y-2 border-t pt-4">
            <Label>Líderes da Equipe ({classMembers.length})</Label>
            <ScrollArea className="h-[250px] rounded border">
              <div className="p-4 space-y-2">
                {classMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum líder compartilhado
                  </p>
                ) : (
                  classMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {member.isOwner && (
                          <div title="Proprietário">
                            <Crown className="w-4 h-4 text-warning" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.full_name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {isCurrentUserOwner && !member.isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMutation.mutate(member.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {!isCurrentUserOwner && (
            <p className="text-sm text-muted-foreground">
              Apenas o proprietário da equipe pode adicionar ou remover líderes.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
