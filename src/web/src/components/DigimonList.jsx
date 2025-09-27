import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useInfiniteDigimons } from '../hooks/useDigimons';
import DigimonCard from './DigimonCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

function getStageClass(stage) {
  const stageMap = {
    'I': 'stage-i', 'II': 'stage-ii', 'III': 'stage-iii', 'IV': 'stage-iv',
    'V': 'stage-v', 'VI': 'stage-vi', 'VI+': 'stage-vi-plus',
    'Human Hybrid': 'stage-human-hybrid', 'Beast Hybrid': 'stage-beast-hybrid'
  };
  return stageMap[stage] || 'stage-i';
}

export function DigimonList({ onDigimonSelect, onImagePreview }) {
  const [selectedStage, setSelectedStage] = useState(null);

  const {
    data,
    error,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteDigimons(20, selectedStage);

  // Intersection Observer nativo (sem biblioteca externa)
  const [loadMoreRef, setLoadMoreRef] = useState(null);

  const loadMoreCallback = useCallback((node) => {
    if (isFetchingNextPage) return;
    if (loadMoreRef) loadMoreRef.disconnect();
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1 });
    
    if (node) observer.observe(node);
    setLoadMoreRef(observer);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    return () => {
      if (loadMoreRef) loadMoreRef.disconnect();
    };
  }, [loadMoreRef]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando Digimons...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage 
          message={error?.message || 'Erro ao carregar Digimons'} 
          onRetry={refetch}
        />
      </div>
    );
  }

  const allDigimons = data?.pages.flatMap(page => page.data) || [];
  
  if (allDigimons.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Nenhum Digimon encontrado
        </p>
      </div>
    );
  }

  // Agrupar por stage
  const digimonsByStage = {};
  allDigimons.forEach(digimon => {
    if (!digimonsByStage[digimon.stage]) {
      digimonsByStage[digimon.stage] = [];
    }
    digimonsByStage[digimon.stage].push(digimon);
  });

  const stageOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VI+', 'Human Hybrid', 'Beast Hybrid'];
  const sortedStages = stageOrder.filter(stage => digimonsByStage[stage]);

  return (
    <div className="space-y-8">
      {/* Filtros por stage */}
      <Card className="digimon-card">
        <CardHeader>
          <CardTitle>Filtrar por Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={`cursor-pointer transition-all ${
                selectedStage === null 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedStage(null)}
            >
              Todos
            </Badge>
            {stageOrder.map(stage => (
              digimonsByStage[stage] && (
                <Badge
                  key={stage}
                  className={`cursor-pointer transition-all ${
                    selectedStage === stage 
                      ? 'bg-primary text-primary-foreground' 
                      : `stage-badge ${getStageClass(stage)} hover:opacity-80`
                  }`}
                  onClick={() => setSelectedStage(stage)}
                >
                  Stage {stage} ({digimonsByStage[stage].length})
                </Badge>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Digimons por stage */}
      {sortedStages.map(stage => (
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
                  const aIsNum = Number.isFinite(an);
                  const bIsNum = Number.isFinite(bn);
                  if (aIsNum && bIsNum) return an - bn;
                  if (aIsNum) return -1;
                  if (bIsNum) return 1;
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

      {/* Trigger para infinite scroll */}
      <div ref={loadMoreCallback} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Carregando mais Digimons...
            </p>
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
