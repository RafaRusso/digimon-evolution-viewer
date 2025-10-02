import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import teamService from '../services/teamService';

/**
 * Hook personalizado para gerenciar times de Digimons
 * 
 * Integra o serviço de teams com React Query para:
 * - Cache reativo
 * - Sincronização automática entre componentes
 * - Optimistic updates
 * - Notificações de sucesso/erro
 */

// Chaves de query para o React Query
const QUERY_KEYS = {
  teams: ['teams'],
  teamsCount: ['teams', 'count'],
  teamsStats: ['teams', 'stats'],
  team: (id) => ['teams', 'team', id],
  teamAnalysis: (id) => ['teams', 'analysis', id],
};

/**
 * Hook principal para gerenciar todos os times
 */
export function useTeams() {
  const queryClient = useQueryClient();

  // Query para obter todos os times
  const teamsQuery = useQuery({
    queryKey: QUERY_KEYS.teams,
    queryFn: () => teamService.getAllTeams(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para adicionar time
  const addTeamMutation = useMutation({
    mutationFn: ({ name, description }) => {
      const result = teamService.addTeam(name, description);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async ({ name, description }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.teams });

      // Snapshot do estado anterior
      const previousTeams = queryClient.getQueryData(QUERY_KEYS.teams);

      // Optimistic update
      const newTeam = teamService.createEmptyTeam(name, description);
      queryClient.setQueryData(QUERY_KEYS.teams, (old) => [...(old || []), newTeam]);

      return { previousTeams };
    },
    onError: (error, variables, context) => {
      // Reverte o optimistic update
      queryClient.setQueryData(QUERY_KEYS.teams, context.previousTeams);
      toast.error(error.message || 'Erro ao criar time');
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onSettled: () => {
      // Invalida queries relacionadas para garantir sincronização
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsStats });
    },
  });

  // Mutation para atualizar time
  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, updates }) => {
      const result = teamService.updateTeam(teamId, updates);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async ({ teamId, updates }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.teams });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.team(teamId) });

      const previousTeams = queryClient.getQueryData(QUERY_KEYS.teams);
      const previousTeam = queryClient.getQueryData(QUERY_KEYS.team(teamId));

      // Optimistic update
      queryClient.setQueryData(QUERY_KEYS.teams, (old) => 
        (old || []).map(team => 
          team.id === teamId 
            ? { ...team, ...updates, updatedAt: new Date().toISOString() }
            : team
        )
      );

      queryClient.setQueryData(QUERY_KEYS.team(teamId), (old) => 
        old ? { ...old, ...updates, updatedAt: new Date().toISOString() } : old
      );

      return { previousTeams, previousTeam };
    },
    onError: (error, { teamId }, context) => {
      queryClient.setQueryData(QUERY_KEYS.teams, context.previousTeams);
      queryClient.setQueryData(QUERY_KEYS.team(teamId), context.previousTeam);
      toast.error(error.message || 'Erro ao atualizar time');
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsStats });
    },
  });

  // Mutation para remover time
  const removeTeamMutation = useMutation({
    mutationFn: (teamId) => {
      const result = teamService.removeTeam(teamId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async (teamId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.teams });

      const previousTeams = queryClient.getQueryData(QUERY_KEYS.teams);

      // Optimistic update
      queryClient.setQueryData(QUERY_KEYS.teams, (old) => 
        (old || []).filter(team => team.id !== teamId)
      );

      return { previousTeams };
    },
    onError: (error, teamId, context) => {
      queryClient.setQueryData(QUERY_KEYS.teams, context.previousTeams);
      toast.error(error.message || 'Erro ao remover time');
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsStats });
    },
  });

  // Mutation para limpar todos os times
  const clearAllTeamsMutation = useMutation({
    mutationFn: () => {
      const result = teamService.clearAllTeams();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsStats });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao limpar times');
    },
  });

  return {
    // Dados
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    error: teamsQuery.error,

    // Ações
    addTeam: addTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    removeTeam: removeTeamMutation.mutate,
    clearAllTeams: clearAllTeamsMutation.mutate,

    // Estados das mutations
    isAddingTeam: addTeamMutation.isPending,
    isUpdatingTeam: updateTeamMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,
    isClearingTeams: clearAllTeamsMutation.isPending,

    // Função de refetch
    refetch: teamsQuery.refetch,
  };
}

/**
 * Hook para obter um time específico por ID
 */
export function useTeam(teamId) {
  return useQuery({
    queryKey: QUERY_KEYS.team(teamId),
    queryFn: () => teamService.getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obter a contagem de times
 */
export function useTeamsCount() {
  return useQuery({
    queryKey: QUERY_KEYS.teamsCount,
    queryFn: () => teamService.getTeamsCount(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obter estatísticas dos times
 */
export function useTeamsStats() {
  return useQuery({
    queryKey: QUERY_KEYS.teamsStats,
    queryFn: () => teamService.getTeamsStats(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para análise de tipagens de um time
 */
export function useTeamAnalysis(teamId) {

  return useQuery({
    queryKey: QUERY_KEYS.teamAnalysis(teamId),
    queryFn: () => {
      const team = teamService.getTeamById(teamId);
      return teamService.getTeamTypeAnalysis(team);
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    // Atualiza automaticamente quando o time muda
    refetchOnMount: true,
  });
}

/**
 * Hook para gerenciar Digimons em um time
 */
export function useTeamDigimons(teamId) {
  const queryClient = useQueryClient();

  // Mutation para adicionar Digimon ao time
  const addDigimonMutation = useMutation({
    mutationFn: ({ digimon, slotType, position }) => {
      const result = teamService.addDigimonToTeam(teamId, digimon, slotType, position);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      // Invalida queries relacionadas ao time
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team(teamId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamAnalysis(teamId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao adicionar Digimon ao time');
    },
  });

  // Mutation para remover Digimon do time
  const removeDigimonMutation = useMutation({
    mutationFn: ({ slotType, position }) => {
      const result = teamService.removeDigimonFromTeam(teamId, slotType, position);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team(teamId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamAnalysis(teamId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover Digimon do time');
    },
  });

  // Mutation para mover Digimon no time
  const moveDigimonMutation = useMutation({
    mutationFn: ({ fromSlotType, fromPosition, toSlotType, toPosition }) => {
      const result = teamService.moveDigimonInTeam(teamId, fromSlotType, fromPosition, toSlotType, toPosition);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team(teamId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamAnalysis(teamId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao mover Digimon');
    },
  });

  return {
    addDigimon: addDigimonMutation.mutate,
    removeDigimon: removeDigimonMutation.mutate,
    moveDigimon: moveDigimonMutation.mutate,
    
    isAddingDigimon: addDigimonMutation.isPending,
    isRemovingDigimon: removeDigimonMutation.isPending,
    isMovingDigimon: moveDigimonMutation.isPending,
  };
}

/**
 * Hook para importar/exportar times
 */
export function useTeamsImportExport() {
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: () => {
      const exported = teamService.exportTeams();
      if (!exported) throw new Error('Erro ao exportar times');
      return exported;
    },
    onSuccess: (data) => {
      // Cria um blob e faz download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digimon-teams-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Times exportados com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao exportar times');
    },
  });

  const importMutation = useMutation({
    mutationFn: (jsonData) => {
      const result = teamService.importTeams(jsonData);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamsStats });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao importar times');
    },
  });

  return {
    exportTeams: exportMutation.mutate,
    importTeams: importMutation.mutate,
    isExporting: exportMutation.isPending,
    isImporting: importMutation.isPending,
  };
}
