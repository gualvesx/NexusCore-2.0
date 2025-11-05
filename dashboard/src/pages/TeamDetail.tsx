import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, Class, Student as Member, Leader } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Loader2,
  Crown,
  User,
} from "lucide-react";
import { ManageMembersDialog } from "@/components/Management/ManageMembersDialog";
import { ManageLeadersDialog } from "@/components/Management/ManageLeadersDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [leadersDialogOpen, setLeadersDialogOpen] = useState(false);

  // 1. Buscar Detalhes da Equipe
  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.getClass(teamId!),
    enabled: !!teamId,
  });

  // 2. Buscar Membros da Equipe
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => api.getStudentsByClass(teamId!),
    enabled: !!teamId,
  });

  // 3. Buscar Líderes da Equipe
  const { data: leaders = [], isLoading: isLoadingLeaders } = useQuery({
    queryKey: ["teamLeaders", teamId],
    queryFn: () => api.getLeadersByClass(teamId!),
    enabled: !!teamId,
  });

  const isLoading = isLoadingTeam || isLoadingMembers || isLoadingLeaders;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header da Página */}
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
                  <h1 className="text-xl font-arvo font-bold hover:text-primary transition-colors">
                    {team?.name}
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Detalhes da Equipe
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setMembersDialogOpen(true)}
                className="gap-2 hover:bg-primary/10 hover:text-primary"
                disabled={!team}
              >
                <UserPlus className="w-4 h-4" />
                Gerenciar Membros
              </Button>
              <Button
                variant="outline"
                onClick={() => setLeadersDialogOpen(true)}
                className="gap-2 hover:bg-success/10 hover:text-success"
                disabled={!team}
              >
                <UsersRound className="w-4 h-4" />
                Gerenciar Líderes
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Líderes */}
            <Card className="lg:col-span-1 border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-arvo">
                  Líderes ({leaders.length})
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
                  <div className="space-y-4 pt-2">
                    {leaders.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum líder nesta equipe.
                      </p>
                    )}
                    {leaders.map((leader) => (
                      <div
                        key={leader.uid}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Avatar>
                          <AvatarImage
                            src={leader.photo_url || undefined}
                            alt={leader.full_name}
                          />
                          <AvatarFallback>
                            {getInitials(leader.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{leader.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {leader.email}
                          </p>
                        </div>
                        {team?.owner_id === leader.uid && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Proprietário da Equipe</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coluna 2: Membros */}
            <Card className="lg:col-span-2 border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-arvo">
                  Membros ({members.length})
                </CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4 pt-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {members.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum membro nesta equipe.
                      </p>
                    )}
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email ||
                              `ID: ${member.pc_id || member.cpf || "N/A"}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialogs de Gerenciamento */}
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
      </div>
    </TooltipProvider>
  );
};

export default TeamDetail;