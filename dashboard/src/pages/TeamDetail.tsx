import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UsersRound,
  Crown,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { ManageMembersDialog } from "@/components/Management/ManageMembersDialog";
import { ManageLeadersDialog } from "@/components/Management/ManageLeadersDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Função auxiliar para obter as iniciais do nome
const getInitials = (name: string) => {
  if (!name) return "??";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.length > 2 ? initials.substring(0, 2) : initials;
};

const TeamDetail = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [leadersDialogOpen, setLeadersDialogOpen] = useState(false);
  
  // Estados para edição/exclusão
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<{id: string, full_name: string, cpf: string, pc_id: string} | null>(null);

  // 1. Buscar Detalhes da Equipe
  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.getClass(teamId!),
    enabled: !!teamId,
  });

  // 2. Buscar Membros (Alunos)
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => api.getClassStudents(teamId!),
    enabled: !!teamId,
  });

  // 3. Buscar Líderes
  const { data: leadersData, isLoading: isLoadingLeaders } = useQuery({
    queryKey: ["teamLeaders", teamId],
    queryFn: () => api.getClassMembers(teamId!),
    enabled: !!teamId,
  });
  
  const leaders = leadersData?.members || [];
  const isCurrentUserOwner = leadersData?.isCurrentUserOwner || false;

  // --- MUTAÇÕES ---

  // Remover Membro da Equipe
  const removeMemberMutation = useMutation({
    mutationFn: (studentId: string) => api.removeStudentFromClass(teamId!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", teamId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Membro removido com sucesso.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Remover Líder da Equipe
  const removeLeaderMutation = useMutation({
    mutationFn: (leaderId: string) => api.removeClassMember(teamId!, leaderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamLeaders", teamId] });
      toast.success("Líder removido com sucesso.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Editar Membro (Nome/Dados)
  const updateMemberMutation = useMutation({
    mutationFn: (data: { id: string; fullName: string; cpf?: string; pc_id?: string }) => 
      api.updateStudent(data.id, { fullName: data.fullName, cpf: data.cpf, pc_id: data.pc_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", teamId] });
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      toast.success("Dados do membro atualizados.");
      setEditMemberOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEditMemberClick = (member: any) => {
    setMemberToEdit({
      id: member.id,
      full_name: member.full_name,
      cpf: member.cpf || "",
      pc_id: member.pc_id || ""
    });
    setEditMemberOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberToEdit) {
      updateMemberMutation.mutate({
        id: memberToEdit.id,
        fullName: memberToEdit.full_name,
        cpf: memberToEdit.cpf,
        pc_id: memberToEdit.pc_id
      });
    }
  };

  const isLoading = isLoadingTeam || isLoadingMembers || isLoadingLeaders;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/management")}
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              {isLoadingTeam ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <div>
                  <h1 className="text-xl font-bold hover:text-primary transition-colors">
                    {team?.name}
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    {t("management.classDescription") || "Detalhes da Equipe"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <ThemeToggle />
              
              <Button
                variant="outline"
                onClick={() => setMembersDialogOpen(true)}
                className="gap-2 hover:bg-primary/10 hover:text-primary"
                disabled={!team}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t("management.manageStudents")}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLeadersDialogOpen(true)}
                className="gap-2 hover:bg-success/10 hover:text-success"
                disabled={!team}
              >
                <UsersRound className="w-4 h-4" />
                <span className="hidden sm:inline">{t("management.manageProfessors")}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card Líderes */}
            <Card className="lg:col-span-1 border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {t("management.leaders")} ({leaders.length})
                </CardTitle>
                <UsersRound className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4 pt-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    {leaders.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum líder nesta equipe.
                      </p>
                    )}
                    {leaders.map((leader) => (
                      <div
                        key={leader.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={leader.photo_url} alt={leader.full_name} />
                          <AvatarFallback>{getInitials(leader.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{leader.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{leader.email}</p>
                        </div>
                        
                        {/* Ações do Líder */}
                        <div className="flex items-center gap-1">
                          {(team?.owner_id === leader.id || (leader as any).isOwner) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent><p>{t("management.owner")}</p></TooltipContent>
                            </Tooltip>
                          ) : isCurrentUserOwner ? (
                             // Só o dono pode remover outros líderes
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeLeaderMutation.mutate(leader.id)}
                                disabled={removeLeaderMutation.isPending}
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Membros */}
            <Card className="lg:col-span-2 border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {t("management.members")} ({members.length})
                </CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4 pt-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    {members.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum membro nesta equipe.
                      </p>
                    )}
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{member.full_name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {member.email && <span>{member.email}</span>}
                            {(member.pc_id || member.cpf) && (
                              <span className="font-mono bg-muted px-1 rounded">
                                ID: {member.pc_id || member.cpf}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações do Membro */}
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMemberClick(member)}
                                className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Dados</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMemberMutation.mutate(member.id!)}
                                disabled={removeMemberMutation.isPending}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {removeMemberMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Remover da Equipe</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialogs de Gerenciamento Global (Adicionar) */}
        <ManageMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          classData={team}
        />
        <ManageLeadersDialog
          open={leadersDialogOpen}
          onOpenChange={setLeadersDialogOpen}
          classData={team}
        />

        {/* Dialog de Edição Inline de Membro */}
        <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            {memberToEdit && (
              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <Label htmlFor="editName">Nome Completo</Label>
                  <Input 
                    id="editName" 
                    value={memberToEdit.full_name} 
                    onChange={e => setMemberToEdit({...memberToEdit, full_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                   <Label htmlFor="editCpf">CPF</Label>
                   <Input 
                     id="editCpf" 
                     value={memberToEdit.cpf} 
                     onChange={e => setMemberToEdit({...memberToEdit, cpf: e.target.value})}
                   />
                </div>
                <div>
                   <Label htmlFor="editPcId">ID do PC</Label>
                   <Input 
                     id="editPcId" 
                     value={memberToEdit.pc_id} 
                     onChange={e => setMemberToEdit({...memberToEdit, pc_id: e.target.value})}
                   />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditMemberOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={updateMemberMutation.isPending}>
                    {updateMemberMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};

export default TeamDetail;