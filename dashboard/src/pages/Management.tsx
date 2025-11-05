import {
  Shield,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  UserPlus,
  UsersRound,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Class } from "@/services/api";
import { CreateTeamDialog } from "@/components/Management/CreateTeamDialog";
import { ManageMembersDialog } from "@/components/Management/ManageMembersDialog";
import { ManageLeadersDialog } from "@/components/Management/ManageLeadersDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Management = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [leadersDialogOpen, setLeadersDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const queryClient = useQueryClient();

  // A query permanece a mesma
  const { data: classes = [], isLoading, isFetching } = useQuery({
    queryKey: ["classes"],
    queryFn: api.getClasses,
  });

  const deleteMutation = useMutation({
    mutationFn: (classId: string) => api.deleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Equipe excluída com sucesso!");
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir equipe: ${error.message}`);
    },
  });

  const handleCopyId = (id: string | undefined) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success("ID da Equipe copiado!");
  };

  const filteredTeams = classes.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageMembers = (classData: Class) => {
    setSelectedClass(classData);
    setMembersDialogOpen(true);
  };

  const handleManageLeaders = (classData: Class) => {
    setSelectedClass(classData);
    setLeadersDialogOpen(true);
  };

  const handleDeleteClick = (classData: Class) => {
    setClassToDelete(classData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete?.id) {
      deleteMutation.mutate(classToDelete.id);
    }
  };

  // REMOVEMOS A FUNÇÃO 'renderTableStatus()'

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <img
                  src="/LOGO.png"
                  alt="NexusCore Security Logo"
                  className="w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                />
                <div>
                  <h1 className="text-xl font-arvo font-bold hover:text-primary transition-colors">
                    NexusCore Security
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Gerenciamento
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <LanguageSelector />
                <ThemeToggle />
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                >
                  Dashboard
                </Button>
                <Button
                  variant="destructive"
                  className="hover:scale-105 transition-transform duration-300"
                >
                  SAIR
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* ... (Cards de Stats - sem mudança) ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <Card className="border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Total de Equipes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold group-hover:text-primary transition-colors">
                  {isLoading ? "..." : classes.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-xl hover:shadow-success/5 hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-success to-primary group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Equipes Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success group-hover:scale-110 transition-transform">
                  {isLoading ? "..." : classes.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-secondary group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Total de Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent group-hover:scale-110 transition-transform">
                  {isLoading
                    ? "..."
                    : classes.reduce(
                        (sum, team) => sum + (team.student_count ?? 0),
                        0
                      )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ... (Controles de Busca e Botão - sem mudança) ... */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar equipes ou departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card border-border hover:border-primary focus:border-primary transition-all duration-300"
              />
            </div>
            <Button
              variant="default"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Nova Equipe
            </Button>
          </div>

          {/* Teams Table */}
          <Card className="border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Equipes Cadastradas
                {isFetching && !isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-arvo font-semibold">
                        Nome da Equipe
                      </th>
                      <th className="text-left py-3 px-4 font-arvo font-semibold">
                        Proprietário
                      </th>
                      <th className="text-left py-3 px-4 font-arvo font-semibold">
                        ID da Equipe (Token)
                      </th>
                      <th className="text-left py-3 px-4 font-arvo font-semibold">
                        Membros
                      </th>
                      <th className="text-left py-3 px-4 font-arvo font-semibold">
                        Líderes
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  
                  {/* ====================================================== */}
                  {/* AQUI ESTÁ A LÓGICA DE RENDERIZAÇÃO CORRIGIDA */}
                  {/* ====================================================== */}
                  <tbody>
                    {isLoading ? (
                      // 1. Estado de Carregamento Inicial
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                          Carregando equipes...
                        </td>
                      </tr>
                    ) : classes.length === 0 ? (
                      // 2. Estado Vazio (Nenhuma equipe encontrada)
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhuma equipe cadastrada. Clique em "+ Nova Equipe"
                          para começar.
                        </td>
                      </tr>
                    ) : filteredTeams.length === 0 ? (
                      // 3. Estado de Filtro Vazio (Busca não encontrou nada)
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhuma equipe encontrada com o termo "{searchTerm}".
                        </td>
                      </tr>
                    ) : (
                      // 4. Estado de Sucesso (Renderiza as equipes)
                      filteredTeams.map((team) => (
                        <tr
                          key={team.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors duration-200"
                        >
                          <td className="py-4 px-4 font-medium">
                            <Link
                              to={`/team/${team.id}`}
                              className="font-medium hover:underline underline-offset-4 text-primary"
                            >
                              {team.name}
                            </Link>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {team.owner_name || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-mono text-xs text-muted-foreground truncate max-w-[100px]"
                                title={team.id}
                              >
                                {team.id}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleCopyId(team.id)}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copiar ID da Equipe</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-sm hover:from-primary/20 hover:to-secondary/20 transition-all duration-300">
                              {team.student_count != null
                                ? `${team.student_count} membro${
                                    team.student_count !== 1 ? "s" : ""
                                  }`
                                : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 text-accent text-sm hover:from-accent/20 hover:to-primary/20 transition-all duration-300">
                              {team.professor_count != null
                                ? `${team.professor_count} líder${
                                    team.professor_count !== 1 ? "es" : ""
                                  }`
                                : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 justify-end">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleManageMembers(team)}
                                    className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                                  >
                                    <UserPlus className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Gerenciar Membros</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleManageLeaders(team)}
                                    className="hover:bg-success/10 hover:text-success transition-all duration-300"
                                  >
                                    <UsersRound className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Gerenciar Líderes</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(team)}
                                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                    disabled={
                                      deleteMutation.isPending &&
                                      classToDelete?.id === team.id
                                    }
                                  >
                                    {deleteMutation.isPending &&
                                    classToDelete?.id === team.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir Equipe</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* ... (Footer e Dialogs - sem mudança) ... */}
        <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/LOGO.png"
                alt="NexusCore Security Logo"
                className="w-6 h-6 rounded shadow-md"
              />
              <span>
                © 2025 NexusCore Security - Sistema de Monitoramento de Acesso.
                Todos os direitos reservados.
              </span>
            </div>
          </div>
        </footer>

        <CreateTeamDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
        <ManageMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          classData={selectedClass}
        />
        <ManageLeadersDialog
          open={leadersDialogOpen}
          onOpenChange={setLeadersDialogOpen}
          classData={selectedClass}
        />

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-arvo">
                Excluir Equipe
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a equipe{" "}
                <strong>{classToDelete?.name}</strong>? Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default Management;