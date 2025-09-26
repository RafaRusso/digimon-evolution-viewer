import { Info, ArrowLeft, ArrowRight, TreePine, ImageIcon, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useEvolutionLineByName } from '../hooks/useDigimons'
import DigimonCard from './DigimonCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import { getAssetImageUrl } from '../lib/utils'
import EvolutionTree from './EvolutionTree';
import { useState } from 'react';
import EvolutionRequirements from './EvolutionRequirements'; 

// Função para obter classe CSS do stage
function getStageClass(stage) {
  const stageMap = {
    'I': 'stage-i',
    'II': 'stage-ii',
    'III': 'stage-iii',
    'IV': 'stage-iv',
    'V': 'stage-v',
    'VI': 'stage-vi',
    'VI+': 'stage-vi-plus',
    'Human Hybrid': 'stage-human-hybrid',
    'Beast Hybrid': 'stage-beast-hybrid'
  }
  return stageMap[stage] || 'stage-i'
}

// Função para obter classe CSS do atributo
function getAttributeClass(attribute) {
  const attributeMap = {
    'Vaccine': 'attribute-vaccine',
    'Data': 'attribute-data',
    'Virus': 'attribute-virus',
    'Variable': 'attribute-variable',
    'N/A': 'attribute-na'
  }
  return attributeMap[attribute] || 'attribute-na'
}

export function EvolutionView({ digimon, onDigimonSelect, onImagePreview }) {
  const handleTreeSelect = (selectedDigimonFromTree) => {
    if (onDigimonSelect) {
      onDigimonSelect(selectedDigimonFromTree, 'evolution');
    }
  };
  const [isPredecessorsOpen, setIsPredecessorsOpen] = useState(true);
  const [isSuccessorsOpen, setIsSuccessorsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('evolutions'); // Padrão é 'evolutions'
  // Buscar linha evolutiva completa
  const { 
    data: evolutionData, 
    isLoading, 
    error, 
    isError,
    refetch 
  } = useEvolutionLineByName(digimon.name)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando linha evolutiva...
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage 
          message={error?.message || 'Erro ao carregar linha evolutiva'} 
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!evolutionData?.data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Linha evolutiva não encontrada
        </p>
      </div>
    )
  }
  const { current, predecessors, successors } = evolutionData.data
  const imageUrl = getAssetImageUrl(current.image_url);
  
  return (
    <div className="space-y-8">
      {/* Informações do Digimon selecionado */}
      <Card className="border-2 border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-md shadow-xl">
        <CardHeader>
          <div className="flex items-start gap-6">
            <div 
              className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-600 cursor-zoom-in group"
              onClick={() => onImagePreview(current)}
              title="Clique para ampliar"
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={current.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-3xl mb-3">
                <Info className="w-8 h-8 text-blue-600" />
                {current.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-3 text-lg">
                <span className="font-semibold">#{current.number}</span>
                <Badge className={`stage-badge ${getStageClass(current.stage)} text-sm font-bold px-3 py-1`}>
                  Stage {current.stage}
                </Badge>
                <Badge className={`stage-badge ${getAttributeClass(current.attribute)} text-sm font-bold px-3 py-1`}>
                  {current.attribute}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs  value={activeTab}
        onValueChange={setActiveTab}
        className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-0">
          <TabsTrigger value="evolutions" className="rounded-xl font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white py-0">
            Evoluções
          </TabsTrigger>
          <TabsTrigger value="tree" className="rounded-xl font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white py-0">
            Árvore Completa
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="evolutions" className="space-y-8 mt-8">
          {/* Linhas evolutivas */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Evolui De */}
            <Card className="digimon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400 text-xl">
                  <ArrowLeft className="w-6 h-6" />
                  Evolui De ({predecessors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predecessors.length > 0 ? (
                  <div className="space-y-4">
                    {predecessors.map((digimon) => (
                      <DigimonCard
                        key={digimon.id}
                        digimon={digimon}
                        onClick={onDigimonSelect}
                        onImageClick={onImagePreview}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                    Nenhuma pré-evolução encontrada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Evolui Para */}
            <Card className="digimon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-xl">
                  <ArrowRight className="w-6 h-6" />
                  Evolui Para ({successors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {successors.length > 0 ? (
                  <div className="space-y-4">
                    {successors.map((digimon) => (
                  // --- MUDANÇA AQUI ---
                  // Envolve o card e os requisitos em um div
                  <div key={digimon.id} className="space-y-3">
                    <DigimonCard
                      digimon={digimon}
                      onClick={onDigimonSelect}
                      onImageClick={onImagePreview}
                    />
                    <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <EvolutionRequirements requirements={digimon.requirements} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
        
        {/* Aba "Árvore Completa" */}
        <TabsContent value="tree" className="mt-8">
          <Card className="digimon-card">
            <CardHeader>
              {/* ... (Título do Card) ... */}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção de Predecessores Recolhível */}
              {predecessors.length > 0 && (
                <div>
                  <button 
                    className="w-full text-left"
                    onClick={() => setIsPredecessorsOpen(!isPredecessorsOpen)}
                  >
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      Árvore Passada (Predecessors)
                      <ChevronDown className={`ml-auto w-5 h-5 transition-transform ${isPredecessorsOpen ? 'rotate-0' : '-rotate-90'}`} />
                    </h3>
                  </button>
                  {isPredecessorsOpen && (
                    <EvolutionTree
                      treeData={predecessors}
                      onDigimonSelect={(selected) => {
                        setActiveTab('tree');
                        handleTreeSelect(selected);
                      }}
                      onImageClick={onImagePreview}
                    />
                  )}
                </div>
              )}

              {/* Digimon Atual */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Atual
                </h3>
                <div className="max-w-md">
                  <DigimonCard
                    digimon={current}
                    onDigimonSelect={(selected) => {
                      setActiveTab('tree');
                      handleTreeSelect(selected);
                    }}
                    onImageClick={onImagePreview}
                    showFullInfo={true}
                  />
                </div>
              </div>

              {/* Seção de Sucessores Recolhível */}
              {successors.length > 0 && (
                <div>
                  <button 
                    className="w-full text-left"
                    onClick={() => setIsSuccessorsOpen(!isSuccessorsOpen)}
                  >
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Árvore Futura (Sucessores)
                      <ChevronDown className={`ml-auto w-5 h-5 transition-transform ${isSuccessorsOpen ? 'rotate-0' : '-rotate-90'}`} />
                    </h3>
                  </button>
                  {isSuccessorsOpen && (
                    <EvolutionTree
                      treeData={successors}
                      onDigimonSelect={(selected) => {
                        setActiveTab('tree');
                        handleTreeSelect(selected);
                      }}
                      onImageClick={onImagePreview}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EvolutionView
