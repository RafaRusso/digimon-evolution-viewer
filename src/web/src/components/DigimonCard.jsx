import React from 'react';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { getAssetImageUrl } from '../lib/utils';
import { CompactFavoriteButton } from './FavoriteButton';

// Funções para obter as classes de cor
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
  return stageMap[stage] || 'stage-i';
}

function getAttributeClass(attribute) {
  const attributeMap = {
    'Vaccine': 'attribute-vaccine', 'Data': 'attribute-data', 'Virus': 'attribute-virus',
    'Variable': 'attribute-variable', 'N/A': 'attribute-na'
  };
  return attributeMap[attribute] || 'attribute-na';
}

export function DigimonCard({ 
  digimon, 
  onClick, 
  onImageClick,
  children
}) {
  const imageUrl = getAssetImageUrl(digimon.image_url);

  const handleCardClick = () => {
    if (onClick) onClick(digimon);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (onImageClick) onImageClick(digimon);
  };

  return (
    <div className="group relative">
      <Card 
        className="digimon-card cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Botão de favorito posicionado absolutamente */}
        <CompactFavoriteButton digimon={digimon} />
        
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center group-hover:shadow-md transition-all duration-300 cursor-zoom-in border-2 border-gray-200/50 dark:border-gray-600/50"
              onClick={handleImageClick}
              title="Clique para ampliar"
            >
              {imageUrl ? <img src={imageUrl} alt={digimon.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">
                {digimon.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                <span className="font-semibold">#{digimon.number}</span>
                {/* CORREÇÃO: Adicionando as classes de cor dinamicamente */}
                <Badge className={`stage-badge ${getStageClass(digimon.stage)}`}>
                  Stage {digimon.stage}
                </Badge>
                <Badge className={`attribute-badge ${getAttributeClass(digimon.attribute)}`}>
                  {digimon.attribute}
                </Badge>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors duration-300" />
          </div>
          
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export default DigimonCard;
