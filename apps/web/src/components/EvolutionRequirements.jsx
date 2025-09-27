// Em src/components/EvolutionRequirements.jsx

import { Zap, Star } from 'lucide-react';

function EvolutionRequirements({ requirements }) {
  // Verifica se há requisitos para renderizar
  const hasStats = requirements?.stats?.length > 0;
  const hasOther = requirements?.other?.length > 0;

  if (!hasStats && !hasOther) {
    return (
      <p className="text-sm text-gray-500 italic">Nenhum requisito especial.</p>
    );
  }

  return (
    <div className="space-y-3">
      {hasStats && (
        <div className="space-y-1">
          {requirements.stats.map((stat, index) => (
            <div key={`stat-${index}`} className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {stat.description}
              </span>
            </div>
          ))}
        </div>
      )}
      {hasOther && (
        <div className="space-y-1">
          {requirements.other.map((req, index) => (
            <div key={`other-${index}`} className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {req.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvolutionRequirements;
