import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { digimonApi } from '../lib/api'

// Hook para buscar Digimons com paginação
export function useDigimons(page = 1, limit = 50, stage = null) {
  return useQuery({
    queryKey: ['digimons', page, limit, stage],
    queryFn: () => digimonApi.getDigimons(page, limit, stage),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para busca infinita de Digimons
export function useInfiniteDigimons(limit = 50, stage = null) {
  return useInfiniteQuery({
    queryKey: ['digimons-infinite', limit, stage],
    queryFn: ({ pageParam = 1 }) => digimonApi.getDigimons(pageParam, limit, stage),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.meta
      return pagination.hasNextPage ? pagination.currentPage + 1 : undefined
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Hook para buscar Digimons por termo
export function useSearchDigimons(query, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['search-digimons', query, limit],
    queryFn: () => digimonApi.searchDigimons(query, limit),
    enabled: enabled && query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar Digimon por ID
export function useDigimon(id, enabled = true) {
  return useQuery({
    queryKey: ['digimon', id],
    queryFn: () => digimonApi.getDigimonById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
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
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
  })
}

// Hook para verificar status da API
export function useApiHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: () => digimonApi.healthCheck(),
    refetchInterval: 30 * 1000, // Verificar a cada 30 segundos
    staleTime: 10 * 1000, // 10 segundos
    cacheTime: 30 * 1000, // 30 segundos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
