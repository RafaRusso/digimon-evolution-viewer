// src/hooks/useDigimonSelector.js
// Hook dedicado exclusivamente para o componente DigimonSelector

import { useQuery } from '@tanstack/react-query';
import { digimonApi } from '../lib/api';

/**
 * Hook customizado para o componente DigimonSelector.
 * Gerencia a busca paginada com filtros de nome, estágio e atributo.
 * 
 * @param {object} filters - Um objeto contendo os filtros e a paginação.
 * @param {number} filters.page - A página atual.
 * @param {number} filters.limit - Quantidade de itens por página.
 * @param {string} [filters.name] - O termo de busca para o nome.
 * @param {string} [filters.stage] - O estágio para filtrar.
 * @param {string} [filters.attribute] - O atributo para filtrar.
 */
export function useDigimonSelector({ page, limit, name, stage, attribute }) {
    console.log(name)
  return useQuery({
    // A queryKey inclui todos os filtros para garantir que o React Query 
    // refaça a busca sempre que qualquer um desses valores mudar
    queryKey: ['digimonSelector', { page, limit, name, stage, attribute }],

    // A queryFn chama a API passando os parâmetros corretos
    // IMPORTANTE: A API espera o nome no parâmetro 'name', não 'q'
    queryFn: () => digimonApi.getDigimons(page, limit, stage, attribute, name),

    // keepPreviousData mantém os dados da página anterior visíveis 
    // enquanto os novos dados carregam, evitando que a tela pisque
    keepPreviousData: true,

    // Define um tempo em que os dados são considerados "frescos"
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}