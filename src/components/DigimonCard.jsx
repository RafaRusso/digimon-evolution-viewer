import { ArrowRight, ImageIcon, Zap, Star } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { getAssetImageUrl } from '../lib/utils'

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

// Componente para requisitos de evolução
function EvolutionRequirements({ requirements }) {
  if (!requirements || (!requirements.stats?.length && !requirements.other?.length)) {
    return null
  }

  return (
    <div className="evolution-requirements">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-500" />
        Requisitos para Evolução
      </div>
      <div className="space-y-2">
        {requirements.stats?.map((stat, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {stat.description}
            </span>
          </div>
        ))}
        {requirements.other?.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {req.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente principal do card
export function DigimonCard({ 
  digimon, 
  onClick, 
  showFullInfo = false, 
  showRequirements = false,
  onImageClick = null,
  variant = 'default' 
}) { 
  const isCompact = variant === 'compact';
  const imageUrlString = digimon.image_url || digimon.imageUrl;
  const imageUrl = getAssetImageUrl(imageUrlString);

  const handleCardClick = () => {
    if (onClick) {
      onClick(digimon)
    }
  }

  const handleImageClick = (e) => {
    e.stopPropagation()
    if (onImageClick) {

      onImageClick(digimon)
    }
  }

  return (
    <div className="group relative">
      <Card 
        className={`digimon-card cursor-pointer transition-all duration-200 ${isCompact ? 'shadow-none hover:shadow-md' : ''}`}
        onClick={handleCardClick}
      >
        <CardContent className={isCompact ? 'p-2' : 'p-4'}>
          <div className="flex items-center gap-3">
            {/* Imagem do Digimon */}
            <div
              className={`flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-zoom-in border border-gray-200/50 dark:border-gray-600/50 ${isCompact ? 'w-10 h-10' : 'w-16 h-16'}`}
              onClick={handleImageClick}
              title="Clique para ampliar"
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={digimon.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            
            {/* Informações do Digimon */}
            <div className="flex-1 min-w-0">
            <div className={`font-bold text-gray-900 dark:text-white truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
                {digimon.name}
              </div>
              <div className={`text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                <span className="font-semibold">#{digimon.number}</span>
                <span>•</span>
                {showFullInfo ? (
                  <>
                    <Badge className={`stage-badge ${getStageClass(digimon.stage)}`}>
                      Stage {digimon.stage}
                    </Badge>
                    <Badge className={`stage-badge ${getAttributeClass(digimon.attribute)}`}>
                      {digimon.attribute}
                    </Badge>
                  </>
                ) : (
                  <span>Stage {digimon.stage} • {digimon.attribute}</span>
                )}
              </div>
            </div>
            
            {/* Seta de navegação */}
            <ArrowRight className={`w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors duration-300 ${isCompact ? 'hidden' : 'block'}`} />
          </div>
          
          {/* Requisitos de evolução */}
          {showRequirements && digimon.requirements && (
            <EvolutionRequirements requirements={digimon.requirements} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DigimonCard
