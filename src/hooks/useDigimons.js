import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { digimonApi } from '../lib/api' // Verifique se o caminho está correto

// Hook para buscar Digimons com paginação (Nenhuma mudança necessária)
export function useDigimons(page = 1, limit = 50, stage = null) {
  return useQuery({
    queryKey: ['digimons', page, limit, stage],
    queryFn: () => digimonApi.getDigimons(page, limit, stage),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Hook para busca infinita de Digimons (CORRIGIDO)
export function useInfiniteDigimons(limit = 50, stage = null) {
  return useInfiniteQuery({
    queryKey: ['digimons-infinite', limit, stage],
    queryFn: ({ pageParam = 1 }) => digimonApi.getDigimons(pageParam, limit, stage),
    
    // --- LÓGICA CORRIGIDA AQUI ---
    getNextPageParam: (lastPage) => {
      // 1. Acessa a paginação diretamente da resposta da API
      const pagination = lastPage.pagination;

      // 2. Se não houver dados de paginação, não há próxima página
      if (!pagination) {
        return undefined;
      }

      // 3. Calcula se há uma próxima página
      const hasNextPage = pagination.page < pagination.totalPages;

      // 4. Se houver, retorna o número da próxima página. Senão, undefined.
      return hasNextPage ? pagination.page + 1 : undefined;
    },
    // --- FIM DA CORREÇÃO ---

    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// --- NENHUMA MUDANÇA NECESSÁRIA NOS HOOKS ABAIXO ---

// Hook para buscar Digimons por termo
export function useSearchDigimons(query, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['search-digimons', query, limit],
    queryFn: () => digimonApi.searchDigimons(query, limit),
    enabled: enabled && !!query && query.length > 2, // Sugestão: buscar apenas com 3+ caracteres
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  })
}

// Hook para buscar Digimon por ID
export function useDigimon(id, enabled = true) {
  return useQuery({
    queryKey: ['digimon', id],
    queryFn: () => digimonApi.getDigimonById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })
}

// Hook para buscar Digimon por nome
export function useDigimonByName(name, enabled = true) {
  return useQuery({
    queryKey: ['digimon-by-name', name],
    queryFn: () => digimonApi.getDigimonByName(name),
    enabled: enabled && !!name,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })
}

// Hook para buscar evoluções de um Digimon
export function useDigimonEvolutions(id, enabled = true) {
  return useQuery({
    queryKey: ['digimon-evolutions', id],
    queryFn: () => digimonApi.getDigimonEvolutions(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })
}

// Hook para buscar linha evolutiva completa
export function useEvolutionLine(id, enabled = true) {
  return useQuery({
    queryKey: ['evolution-line', id],
    queryFn: () => digimonApi.getEvolutionLine(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })
}

// Hook para buscar linha evolutiva por nome
export function useEvolutionLineByName(name, enabled = true) {
  return useQuery({
    queryKey: ['evolution-line-by-name', name],
    queryFn: () => digimonApi.getEvolutionLineByName(name),
    enabled: enabled && !!name,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })
}

// Hook para buscar estatísticas
export function useDigimonStats() {
  return useQuery({
    queryKey: ['digimon-stats'],
    queryFn: () => digimonApi.getStats(),
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  })
}

// Hook para verificar status da API
export function useApiHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: () => digimonApi.healthCheck(),
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
    cacheTime: 30 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
