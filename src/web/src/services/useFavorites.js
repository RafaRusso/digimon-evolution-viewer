import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import favoritesService from '../services/favoritesService';

/**
 * Hook personalizado para gerenciar favoritos
 * 
 * Integra o serviço de favoritos com React Query para:
 * - Cache reativo
 * - Sincronização automática entre componentes
 * - Otimistic updates
 * - Notificações de sucesso/erro
 */

// Chaves de query para o React Query
const QUERY_KEYS = {
  favorites: ['favorites'],
  favoritesCount: ['favorites', 'count'],
  favoritesStats: ['favorites', 'stats'],
  isFavorite: (id) => ['favorites', 'is-favorite', id],
};

/**
 * Hook principal para gerenciar todos os favoritos
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  // Query para obter todos os favoritos
  const favoritesQuery = useQuery({
    queryKey: QUERY_KEYS.favorites,
    queryFn: () => favoritesService.getAllFavorites(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para adicionar favorito
  const addFavoriteMutation = useMutation({
    mutationFn: (digimon) => {
      const result = favoritesService.addFavorite(digimon);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async (digimon) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites });

      // Snapshot do estado anterior
      const previousFavorites = queryClient.getQueryData(QUERY_KEYS.favorites);

      // Optimistic update
      const newFavorite = {
        id: digimon.id,
        name: digimon.name,
        number: digimon.number,
        stage: digimon.stage,
        attribute: digimon.attribute,
        image_url: digimon.image_url,
        addedAt: new Date().toISOString(),
        version: '1.0'
      };

      queryClient.setQueryData(QUERY_KEYS.favorites, (old) => [...(old || []), newFavorite]);

      // Atualiza cache do isFavorite
      queryClient.setQueryData(QUERY_KEYS.isFavorite(digimon.id), true);

      return { previousFavorites };
    },
    onError: (error, digimon, context) => {
      // Reverte o optimistic update
      queryClient.setQueryData(QUERY_KEYS.favorites, context.previousFavorites);
      queryClient.setQueryData(QUERY_KEYS.isFavorite(digimon.id), false);
      
      toast.error(error.message || 'Erro ao adicionar favorito');
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onSettled: () => {
      // Invalida queries relacionadas para garantir sincronização
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesStats });
    },
  });

  // Mutation para remover favorito
  const removeFavoriteMutation = useMutation({
    mutationFn: (digimonId) => {
      const result = favoritesService.removeFavorite(digimonId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async (digimonId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites });

      const previousFavorites = queryClient.getQueryData(QUERY_KEYS.favorites);

      // Optimistic update
      queryClient.setQueryData(QUERY_KEYS.favorites, (old) => 
        (old || []).filter(fav => fav.id !== digimonId)
      );

      queryClient.setQueryData(QUERY_KEYS.isFavorite(digimonId), false);

      return { previousFavorites };
    },
    onError: (error, digimonId, context) => {
      queryClient.setQueryData(QUERY_KEYS.favorites, context.previousFavorites);
      queryClient.setQueryData(QUERY_KEYS.isFavorite(digimonId), true);
      
      toast.error(error.message || 'Erro ao remover favorito');
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesStats });
    },
  });

  // Mutation para limpar todos os favoritos
  const clearAllFavoritesMutation = useMutation({
    mutationFn: () => {
      const result = favoritesService.clearAllFavorites();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesStats });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao limpar favoritos');
    },
  });

  return {
    // Dados
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    isError: favoritesQuery.isError,
    error: favoritesQuery.error,

    // Ações
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    clearAllFavorites: clearAllFavoritesMutation.mutate,

    // Estados das mutations
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    isClearingFavorites: clearAllFavoritesMutation.isPending,

    // Função de refetch
    refetch: favoritesQuery.refetch,
  };
}

/**
 * Hook para verificar se um Digimon específico é favorito
 */
export function useIsFavorite(digimonId) {
  return useQuery({
    queryKey: QUERY_KEYS.isFavorite(digimonId),
    queryFn: () => favoritesService.isFavorite(digimonId),
    enabled: !!digimonId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obter a contagem de favoritos
 */
export function useFavoritesCount() {
  return useQuery({
    queryKey: QUERY_KEYS.favoritesCount,
    queryFn: () => favoritesService.getFavoritesCount(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obter estatísticas dos favoritos
 */
export function useFavoritesStats() {
  return useQuery({
    queryKey: QUERY_KEYS.favoritesStats,
    queryFn: () => favoritesService.getFavoritesStats(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para favoritos ordenados por data
 */
export function useFavoritesSortedByDate() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...QUERY_KEYS.favorites, 'sorted-by-date'],
    queryFn: () => favoritesService.getFavoritesSortedByDate(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    // Atualiza automaticamente quando os favoritos mudam
    enabled: !!queryClient.getQueryData(QUERY_KEYS.favorites),
  });
}

/**
 * Hook para favoritos ordenados por nome
 */
export function useFavoritesSortedByName() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...QUERY_KEYS.favorites, 'sorted-by-name'],
    queryFn: () => favoritesService.getFavoritesSortedByName(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: !!queryClient.getQueryData(QUERY_KEYS.favorites),
  });
}

/**
 * Hook para buscar favoritos
 */
export function useSearchFavorites(query) {
  return useQuery({
    queryKey: [...QUERY_KEYS.favorites, 'search', query],
    queryFn: () => favoritesService.searchFavorites(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para favoritos filtrados por stage
 */
export function useFavoritesByStage(stage) {
  return useQuery({
    queryKey: [...QUERY_KEYS.favorites, 'by-stage', stage],
    queryFn: () => favoritesService.getFavoritesByStage(stage),
    enabled: !!stage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para toggle de favorito (adiciona se não é favorito, remove se é)
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (digimon) => {
      const isFavorite = favoritesService.isFavorite(digimon.id);
      
      if (isFavorite) {
        const result = favoritesService.removeFavorite(digimon.id);
        if (!result.success) throw new Error(result.message);
        return { action: 'removed', ...result };
      } else {
        const result = favoritesService.addFavorite(digimon);
        if (!result.success) throw new Error(result.message);
        return { action: 'added', ...result };
      }
    },
    onSuccess: (result) => {
      toast.success(result.message);
      
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesStats });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao alterar favorito');
    },
  });
}

/**
 * Hook para importar/exportar favoritos
 */
export function useFavoritesImportExport() {
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: () => {
      const exported = favoritesService.exportFavorites();
      if (!exported) throw new Error('Erro ao exportar favoritos');
      return exported;
    },
    onSuccess: (data) => {
      // Cria um blob e faz download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digimon-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Favoritos exportados com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao exportar favoritos');
    },
  });

  const importMutation = useMutation({
    mutationFn: (jsonData) => {
      const result = favoritesService.importFavorites(jsonData);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favoritesStats });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao importar favoritos');
    },
  });

  return {
    exportFavorites: exportMutation.mutate,
    importFavorites: importMutation.mutate,
    isExporting: exportMutation.isPending,
    isImporting: importMutation.isPending,
  };
}
