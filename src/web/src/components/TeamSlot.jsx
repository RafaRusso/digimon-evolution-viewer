// src/components/TeamSlot.jsx

import React from 'react';
import { X, Plus, Move } from 'lucide-react'; // Adicionar Move
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { getAssetImageUrl } from '../lib/utils';

export default function TeamSlot({ 
  digimon, 
  slotType, 
  position, 
  onSlotClick, 
  onSlotRemove, 
  onDigimonClick, 
  onImageClick,
  // --- NOVAS PROPS ---
  onMoveInitiate,
  isMoving,      // O próprio Digimon está selecionado para mover?
  isMoveTarget   // Algum Digimon está em modo de movimento?
}) {
  const imageUrl = digimon ? getAssetImageUrl(digimon.image_url) : null;

  // Determina o que acontece quando o card é clicado
  const handleCardClick = () => {
    // Se o slot está ocupado E não estamos em modo de movimento, não faz nada
    // (o clique para adicionar é tratado no 'onSlotClick' do Card vazio)
    if (digimon && !isMoveTarget) return;
    
    // Caso contrário, executa a ação de clique do slot (adicionar ou mover)
    onSlotClick();
  };

  return (
    <div 
      className={cn(
        'relative h-full transition-all',
        // Estilo quando este slot é o alvo de um movimento
        isMoveTarget && !digimon && 'ring-2 ring-dashed ring-green-500 rounded-lg',
        // Estilo quando este Digimon está selecionado para mover
        isMoving && 'ring-4 ring-blue-500 rounded-lg scale-105'
      )}
      onClick={handleCardClick}
    >
      {digimon ? (
        <Card className="overflow-hidden bg-gray-800 border-gray-700 h-full flex flex-col group">
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="relative flex-1">
              {/* Botão de Remover */}
              <button onClick={(e) => { e.stopPropagation(); onSlotRemove(slotType, position); }} className="absolute top-1 right-1 z-20 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              
              {/* Botão de Mover */}
              <button onClick={(e) => { e.stopPropagation(); onMoveInitiate(digimon, slotType, position); }} className="absolute top-1 left-1 z-20 bg-blue-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Move className="w-3 h-3" /></button>

              <div 
                className="aspect-square w-full bg-black/20 p-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onImageClick(digimon); }}
              >
                <img 
                  src={imageUrl} 
                  alt={digimon.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="p-2 text-center bg-gray-900">
              <p 
                className="text-xs font-semibold text-gray-200 truncate cursor-pointer hover:text-blue-400"
                onClick={(e) => { e.stopPropagation(); onDigimonClick(digimon); }}
              >
                {digimon.name}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-full border-2 border-dashed border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-700 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center h-full text-gray-400">
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-sm">Adicionar</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
