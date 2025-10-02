// src/components/DigimonSelector.jsx
// Componente corrigido com parâmetros corretos

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useDigimonSelector } from '../hooks/useDigimonSelector';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { getAssetImageUrl } from '../lib/utils';
import LoadingSpinner from './LoadingSpinner';

export default function DigimonSelector({ onDigimonSelect }) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedAttribute, setSelectedAttribute] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // CORREÇÃO: Usar o estado 'page' corretamente, não 0
  const { 
    data: digimonData, 
    isLoading, 
    isError, 
    error,
    isPreviousData 
  } = useDigimonSelector({
    page: page,
    limit: 10,
    name: debouncedSearchTerm || undefined,
    stage: selectedStage === 'all' ? undefined : selectedStage,
    attribute: selectedAttribute === 'all' ? undefined : selectedAttribute,
  });

  // Debug: vamos ver o que está sendo enviado
  console.log('🎯 Filtros atuais:', {
    page,
    searchTerm: debouncedSearchTerm,
    stage: selectedStage === 'all' ? undefined : selectedStage,
    attribute: selectedAttribute === 'all' ? undefined : selectedAttribute,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedStage, selectedAttribute]);

  const handleDigimonClick = (digimon) => onDigimonSelect?.(digimon);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('all');
    setSelectedAttribute('all');
    setPage(1);
  };

  const digimons = digimonData?.data || [];
  const pagination = digimonData?.meta.pagination;

  // Debug: vamos ver a estrutura da resposta
  console.log('📊 Dados recebidos:', { digimons: digimons.length, pagination });

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar Digimon por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 focus:ring-blue-500"
          />
        </div>
        
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-600 hover:bg-gray-700">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> 
                Filtros
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Estágio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estágios</SelectItem>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="III">III</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="V">V</SelectItem>
                  <SelectItem value="VI">VI</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Atributo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Atributos</SelectItem>
                  <SelectItem value="Data">Data</SelectItem>
                  <SelectItem value="Vaccine">Vaccine</SelectItem>
                  <SelectItem value="Virus">Virus</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={clearFilters} 
              className="w-full text-xs text-gray-400 hover:text-white"
            >
              Limpar Filtros
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && !isPreviousData ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center text-red-400">
            Erro: {error.message}
          </div>
        ) : digimons.length === 0 ? (
          <div className="text-center text-gray-400 pt-10">
            Nenhum Digimon encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {digimons.map((digimon) => (
              <Card 
                key={digimon.id} 
                className="cursor-pointer group overflow-hidden bg-gray-800 border-gray-700 hover:ring-2 hover:ring-blue-500" 
                onClick={() => handleDigimonClick(digimon)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-black/20 flex items-center justify-center p-2">
                    <img 
                      src={getAssetImageUrl(digimon.image_url)} 
                      alt={digimon.name} 
                      className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" 
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 text-center border-t border-gray-700">
                    <p className="text-sm font-semibold truncate text-white">
                      {digimon.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      #{digimon.number}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SEMPRE mostrar os controles de paginação para debug */}
      <div className="p-4 border-t border-gray-700">
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          Debug: Página {page} | Total: {pagination?.totalItems || 0} | Páginas: {pagination?.totalPages || 0}
        </div>
        
        {/* Controles sempre visíveis para teste */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page <= 1 || isPreviousData}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-400">
            Página {page} de {pagination?.totalPages || 1}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => p + 1)} 
            disabled={isPreviousData}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
