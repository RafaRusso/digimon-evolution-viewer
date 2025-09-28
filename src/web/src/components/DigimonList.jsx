import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useInfiniteDigimons } from '../hooks/useDigimons';
import DigimonCard from './DigimonCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Mapeamento de classes para os badges de stage (ATUALIZADO)
function getStageClass(stage) {
  const stageMap = {
    'I': 'stage-i', 'II': 'stage-ii', 'III': 'stage-iii', 'IV': 'stage-iv',
    'V': 'stage-v', 'VI': 'stage-vi', 'VI+': 'stage-vi-plus',
    'Human Hybrid': 'stage-human-hybrid', 'Beast Hybrid': 'stage-beast-hybrid',
    'Armor': 'stage-armor',
    'Fusion Hybrid': 'stage-fusion-hybrid',
    'Golden Armor': 'stage-golden-armor',
    'Transcendent Hybrid': 'stage-transcendent-hybrid'
  };
  return stageMap[stage] || 'stage-i'; // Fallback para uma classe padrão
}

// Lista completa e ordenada de todos os stages possíveis
const ALL_STAGES = [
  'I', 'II', 'III', 'IV', 'Armor', 'Human Hybrid', 'Beast Hybrid', 'V',
  'Fusion Hybrid', 'VI', 'Golden Armor', 'Transcendent Hybrid', 'VI+'
];

export function DigimonList({ onDigimonSelect, onImagePreview }) {
  const [selectedStage, setSelectedStage] = useState(null);

  const {
    data, error, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch
  } = useInfiniteDigimons(20, selectedStage);

  // Intersection Observer para o infinite scroll
  const loadMoreRef = useCallback((node) => {
    if (isFetchingNextPage || !node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando Digimons...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message={error?.message || 'Erro ao carregar Digimons'} onRetry={refetch} />
      </div>
    );
  }

  const allDigimons = data?.pages.flatMap(page => page.data) || [];

  const digimonsByStage = {};
  allDigimons.forEach(digimon => {
    if (!digimonsByStage[digimon.stage]) digimonsByStage[digimon.stage] = [];
    digimonsByStage[digimon.stage].push(digimon);
  });

  const sortedStagesForDisplay = ALL_STAGES.filter(stage => digimonsByStage[stage]);

  // Componente de Filtros reutilizável para evitar repetição de código
  const StageFilters = () => (
    <Card className="digimon-card">
      <CardHeader>
        <CardTitle>Filtrar por Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* SOLUÇÃO 1: Estilo melhorado para o botão "Todos" */}
          <Badge
            className={`cursor-pointer transition-all ${
              selectedStage === null 
                ? 'bg-primary text-primary-foreground' // Ativo
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600' // Inativo, mas visível
            }`}
            onClick={() => setSelectedStage(null)}
          >
            Todos
          </Badge>
          
          {ALL_STAGES.map(stage => {
            const isSelected = selectedStage === stage;
            const count = digimonsByStage[stage]?.length ? `(${digimonsByStage[stage].length})` : '';
            const itemOpacity = selectedStage && !isSelected ? 'opacity-50 hover:opacity-100' : 'opacity-100';

            return (
              <Badge
                key={stage}
                className={`cursor-pointer transition-all ${itemOpacity} ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : `stage-badge ${getStageClass(stage)}`
                }`}
                onClick={() => setSelectedStage(stage)}
              >
                Stage {stage} {count}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (allDigimons.length === 0 && selectedStage) {
    return (
      <>
        <StageFilters />
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Nenhum Digimon encontrado para o stage "{selectedStage}".
          </p>
          <Badge
            className="mt-4 cursor-pointer transition-all bg-primary text-primary-foreground hover:bg-primary/80"
            onClick={() => setSelectedStage(null)}
          >
            Limpar filtro e ver todos
          </Badge>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-8">
      <StageFilters />

      {sortedStagesForDisplay.map(stage => (
        <Card key={stage} className="digimon-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Badge className={`stage-badge ${getStageClass(stage)} text-sm font-bold px-3 py-1`}>
                Stage {stage}
              </Badge>
              <span className="text-lg text-gray-600 dark:text-gray-400 font-semibold">
                {digimonsByStage[stage].length} Digimons
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {digimonsByStage[stage]
                .sort((a, b) => {
                  const an = Number(a?.number);
                  const bn = Number(b?.number);
                  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
                  if (Number.isFinite(an)) return -1;
                  if (Number.isFinite(bn)) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map(digimon => (
                  <DigimonCard
                    key={digimon.id}
                    digimon={digimon}
                    onClick={onDigimonSelect}
                    onImageClick={onImagePreview}
                    showFullInfo={true}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando mais Digimons...</p>
          </div>
        )}
        {!hasNextPage && allDigimons.length > 0 && (
          <p className="text-gray-500 italic">Todos os Digimons foram carregados!</p>
        )}
      </div>
    </div>
  );
}

export default DigimonList;
