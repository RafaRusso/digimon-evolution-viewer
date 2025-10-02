import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { digimonApi } from '../lib/api' // Verifique se o caminho está correto
export function useDigimonSelector({ page, limit, name, stage, attribute }) {
  return useQuery({
    // A queryKey é um array que inclui o nome do hook e um objeto com todos os filtros.
    // Isso garante que o React Query refaça a busca sempre que qualquer um desses valores mudar.
    queryKey: ['digimonSelector', { page, limit, name, stage, attribute }],

    // A queryFn chama a função da API, passando os parâmetros.
    // O backend espera o filtro de nome no parâmetro 'q'.
    queryFn: () => digimonApi.getDigimons(page, limit, stage, attribute, name),

    // keepPreviousData é a chave para uma boa UX na paginação.
    // Ele mantém os dados da página anterior visíveis enquanto os novos dados carregam,
    // evitando que a tela pisque ou que os cards desapareçam.
    keepPreviousData: true,

    // Define um tempo em que os dados são considerados "frescos", evitando buscas desnecessárias.
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
export function useDigimons(page = 1, limit = 12, stage, attribute, name) {
  return useQuery({
    // A queryKey deve incluir TODOS os parâmetros que afetam a busca
    queryKey: ['digimons', page, limit, stage, attribute, name],
    queryFn: () => digimonApi.getDigimons(page, limit, stage, attribute, name),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para busca infinita de Digimons (CORRIGIDO)
export function useInfiniteDigimons(limit = 20, stage = null) {
  return useInfiniteQuery({
    queryKey: ['digimons-infinite', stage],
    queryFn: ({ pageParam = 1 }) => digimonApi.getDigimons(pageParam, limit, stage),
    
    // --- CORREÇÃO FINAL AQUI ---
    getNextPageParam: (lastPage) => {
      // 1. Acessa o objeto de paginação DENTRO de 'meta'
      const pagination = lastPage.meta?.pagination;

      // 2. Se não houver dados de paginação, para.
      if (!pagination) {
        return undefined;
      }

      // 3. Usa a propriedade 'hasNextPage' que a API já calcula!
      // Se 'hasNextPage' for true, retorna o número da próxima página.
      return pagination.hasNextPage ? pagination.currentPage + 1 : undefined;
    },
    // --- FIM DA CORREÇÃO ---

    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
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
