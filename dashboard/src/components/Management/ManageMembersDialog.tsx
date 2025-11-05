import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Class, Student as Member } from "@/services/api"; // Renomeando Student para Member
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Loader2, UserPlus } from "lucide-react";

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
}

// Hook customizado para buscar todos os alunos (members)
const useAllStudents = () => {
  return useQuery({
    queryKey: ["allStudents"],
    queryFn: api.getAllStudents,
    enabled: true, // Manter sempre habilitado para popular o dropdown
  });
};

// Hook customizado para buscar alunos (members) de uma turma específica
const useClassStudents = (classId: string | null) => {
  return useQuery({
    queryKey: ["classStudents", classId],
    queryFn: () => api.getStudentsByClass(classId!),
    enabled: !!classId, // Só executa se classId não for nulo
  });
};

export const ManageMembersDialog = ({ open, onOpenChange, classData }: ManageMembersDialogProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCpf, setNewMemberCpf] = useState("");
  const [newMemberPcId, setNewMemberPcId] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState(""); // <-- NOVO ESTADO (Para Opção 2)
  const queryClient = useQueryClient();

  const { data: allStudents = [] } = useAllStudents();
  const { data: classStudents = [], isLoading: isLoadingClassStudents } = useClassStudents(classData?.id || null);

  // Mutação para adicionar um membro existente à turma
  const addMutation = useMutation({
    mutationFn: (studentId: string) => api.addStudentToClass(classData!.id!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classStudents", classData?.id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Invalida contagem de alunos
      toast.success("Membro adicionado à equipe!");
      setSelectedMemberId("");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar membro: ${error.message}`);
    },
  });

  // Mutação para remover um membro da turma
  const removeMutation = useMutation({
    mutationFn: (studentId: string) => api.removeStudentFromClass(classData!.id!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classStudents", classData?.id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Invalida contagem de alunos
      toast.success("Membro removido da equipe!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover membro: ${error.message}`);
    },
  });

  // Mutação para CRIAR um novo membro e ADICIONÁ-LO à turma
  const createAndAddMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string; cpf?: string; pc_id?: string }) => {
      // 1. Cria o novo membro (aluno)
      const result = await api.createStudent(data);
      // 2. Adiciona o membro criado à turma atual
      await api.addStudentToClass(classData!.id!, result.student.id!);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allStudents"] }); // Atualiza a lista geral
      queryClient.invalidateQueries({ queryKey: ["classStudents", classData?.id] }); // Atualiza a lista da turma
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Atualiza contagem
      toast.success("Membro criado e adicionado com sucesso!");
      // Limpa os campos do formulário
      setNewMemberName("");
      setNewMemberCpf("");
      setNewMemberPcId("");
      setNewMemberEmail(""); 
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleAddExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId) {
      addMutation.mutate(selectedMemberId);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    // Email e Nome são obrigatórios para a Opção 2
    if (newMemberName.trim() && newMemberEmail.trim()) {
      createAndAddMutation.mutate({
        fullName: newMemberName.trim(),
        email: newMemberEmail.trim(), 
        cpf: newMemberCpf.trim() || undefined,
        pc_id: newMemberPcId.trim() || undefined,
      });
    } else {
      toast.error("Nome Completo e Email são obrigatórios para criar um novo membro.");
    }
  };

  // Filtra membros que já não estão nesta turma
  const availableMembers = allStudents.filter(
    (student) => !classStudents.some((classStudent) => classStudent.id === student.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-arvo">Gerenciar Membros - {classData?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Adicionar Membro Existente */}
          <form onSubmit={handleAddExisting} className="space-y-2">
            <Label>Adicionar Membro Existente</Label>
            <div className="flex gap-2">
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um membro..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length > 0 ? (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id!}>
                        {member.full_name} ({member.pc_id || member.cpf || member.email})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum membro disponível para adicionar.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!selectedMemberId || addMutation.isPending}>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>

          {/* Criar Novo Membro */}
          <div className="space-y-2 border-t pt-4">
            <Label>Criar Novo Membro</Label>
            <form onSubmit={handleCreateNew} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="newName">Nome Completo *</Label>
                  <Input
                    id="newName"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Nome do membro"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newEmail">Email (para Login na Extensão) *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="email@membro.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newCpf">CPF (ID Opcional 1)</Label>
                  <Input
                    id="newCpf"
                    value={newMemberCpf}
                    onChange={(e) => setNewMemberCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="newPcId">ID do PC (ID Opcional 2)</Label>
                  <Input
                    id="newPcId"
                    value={newMemberPcId}
                    onChange={(e) => setNewMemberPcId(e.target.value)}
                    placeholder="Ex: joao.silva ou laptop-01"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Para o "Modo Token" (Opção 1/3), preencha CPF ou ID do PC. 
                Para o "Modo Login" (Opção 2), o Email é obrigatório.
              </p>
              <Button type="submit" disabled={createAndAddMutation.isPending} className="w-full">
                {createAndAddMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar e Adicionar Novo Membro"
                )}
              </Button>
            </form>
          </div>

          {/* Lista de Membros na Equipe */}
          <div className="space-y-2 border-t pt-4">
            <Label>Membros na Equipe ({classStudents.length})</Label>
            <ScrollArea className="h-[200px] rounded border">
              <div className="p-4 space-y-2">
                {isLoadingClassStudents ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : classStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum membro nesta equipe.
                  </p>
                ) : (
                  classStudents.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{member.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {/* Mostra o melhor identificador disponível */}
                          {member.email || member.pc_id || member.cpf}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMutation.mutate(member.id!)}
                        disabled={removeMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};