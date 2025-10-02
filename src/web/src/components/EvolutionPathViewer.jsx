// src/components/EvolutionPathViewer.jsx

import React from 'react';
import { useEvolutionLineByName } from '../hooks/useDigimons'; // Verifique o caminho
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import DigimonCard from './DigimonCard';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function EvolutionPathViewer({ digimon, onDigimonSelect, onImageClick }) {
  // --- CORREÇÃO AQUI ---
  // Garante que o nome do digimon seja passado para o hook
  const { data: evolutionData, isLoading, isError, error } = useEvolutionLineByName(
    digimon?.name, // Passa o nome do digimon
    !!digimon?.name // Habilita a query apenas se o digimon e seu nome existirem
  );

  if (isLoading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  if (isError) {
    return <ErrorMessage message={error.message} />;
  }

  const { current, predecessors, successors } = evolutionData?.data || {};

  if (!current) {
    return <div className="text-center text-gray-400 py-8">Não foi possível carregar a linha evolutiva.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Predecessores */}
      {predecessors && predecessors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-400"><ArrowLeft /> Linha Passada</h3>
          <div className="flex flex-wrap gap-4">
            {predecessors.map(p => (
              <DigimonCard key={p.id} digimon={p} onClick={onDigimonSelect} onImageClick={onImageClick} />
            ))}
          </div>
        </div>
      )}

      {/* Atual */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Atual</h3>
        <DigimonCard digimon={current} onImageClick={onImageClick} />
      </div>

      {/* Sucessores */}
      {successors && successors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400"><ArrowRight /> Linha Futura</h3>
          <div className="flex flex-wrap gap-4">
            {successors.map(s => (
              <DigimonCard key={s.id} digimon={s} onClick={onDigimonSelect} onImageClick={onImageClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
