import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// CORREÇÃO: Trocar a importação de 'useContext' e 'FilterContext' por 'useFilters'
import { useFilters } from "@/contexts/FilterContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Skeleton } from "../ui/skeleton";
import { useTranslation } from "react-i18next";

export const Filters = () => {
  const { t } = useTranslation();

  // CORREÇÃO: Usar o hook 'useFilters()' diretamente
  const {
    selectedTeam,
    setSelectedTeam,
    selectedMember,
    setSelectedMember,
    setDateRange,
  } = useFilters();

  // 1. Buscar as equipes
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["classes"],
    queryFn: api.getClasses,
  });

  // 2. Buscar os MEMBROS (alunos) da equipe selecionada
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["teamMembers", selectedTeam],
    queryFn: () => api.getStudentsByClass(selectedTeam!),
    enabled: !!selectedTeam,
  });

  // 3. Buscar os LÍDERES (professores) da equipe selecionada
  const { data: leaders = [], isLoading: isLoadingLeaders } = useQuery({
    queryKey: ["teamLeaders", selectedTeam],
    queryFn: () => api.getLeadersByClass(selectedTeam!),
    enabled: !!selectedTeam,
  });

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value);
    setSelectedMember("all"); // Reseta o membro ao trocar de equipe
  };

  const handleMemberChange = (value: string) => {
    setSelectedMember(value);
  };

  // Lógica de placeholder para os dropdowns
  const teamPlaceholder = isLoadingTeams
    ? t("filters.loadingTeams")
    : t("filters.selectTeam");

  const memberPlaceholder = selectedTeam
    ? isLoadingMembers || isLoadingLeaders
      ? t("filters.loadingMembers")
      : t("filters.selectMember")
    : t("filters.selectTeamFirst");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Seletor de Equipe */}
      <Select onValueChange={handleTeamChange} value={selectedTeam}>
        <SelectTrigger>
          <SelectValue placeholder={teamPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoadingTeams ? (
            <SelectItem value="loading" disabled>
              {t("filters.loadingTeams")}...
            </SelectItem>
          ) : (
            teams.map((team) => (
              <SelectItem key={team.id} value={team.id!}>
                {team.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Seletor de Membro (COM LÍDERES) */}
      <Select
        onValueChange={handleMemberChange}
        value={selectedMember}
        disabled={!selectedTeam || (isLoadingMembers && isLoadingLeaders)}
      >
        <SelectTrigger>
          <SelectValue placeholder={memberPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {selectedTeam ? (
            <>
              {/* Grupo de Membros */}
              <SelectGroup>
                <SelectLabel>{t("filters.members")}</SelectLabel>
                <SelectItem value="all">{t("filters.allMembers")}</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.pc_id || member.cpf || member.id!}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectGroup>
              
              {/* Grupo de Líderes */}
              <SelectGroup>
                <SelectLabel>{t("filters.leaders")}</SelectLabel>
                {leaders.map((leader) => (
                  // Usamos o 'uid' do líder como o 'value'
                  <SelectItem key={leader.id} value={leader.uid}> 
                    {leader.full_name} (Líder)
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : (
            <SelectItem value="loading" disabled>
              {t("filters.selectTeamFirst")}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Seletor de Data (Pendente) */}
      <Skeleton className="h-10" />
      {/* Implementar DateRangePicker aqui */}
    </div>
  );
};