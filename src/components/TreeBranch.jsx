// Em src/components/TreeBranch.jsx

import { getAssetImageUrl } from '../lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { ArrowRightCircle, Info } from 'lucide-react'; 
import EvolutionRequirements from './EvolutionRequirements';

function TreeBranch({ digimon, onSelect, onImageClick }) {
  const imageUrl = getAssetImageUrl(digimon.image_url);
  const hasRequirements = digimon.requirements && (digimon.requirements.stats?.length > 0 || digimon.requirements.other?.length > 0);

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(digimon);
    }
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(digimon);
    }
  };

  return (
    <div className="flex items-center gap-4 p-1.5 rounded-lg transition-colors group">
      {/* Imagem */}
      <div 
        className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-zoom-in"
        onClick={handleImageClick}
        title="Ampliar imagem"
      >
        <img 
          src={imageUrl} 
          alt={digimon.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      
      {/* Informações */}
      <div className="flex-1 min-w-0">
        {/* --- A MUDANÇA ESTÁ AQUI --- */}
        <p 
          // 'inline-block' faz o elemento ter a largura do seu conteúdo.
          className="inline-block font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={handleNameClick}
          title={`Ver detalhes de ${digimon.name}`}
        >
          {digimon.name}
        </p>
        {/* O 'truncate' foi removido do nome, pois agora ele não ocupa a linha toda. */}
        {/* A descrição continua abaixo normalmente. */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          #{digimon.number} • Stage {digimon.stage}
        </p>
      </div>
        {/* --- POPUP DE REQUISITOS --- */}
        {hasRequirements && (
                <Popover.Root>
                <Popover.Trigger asChild>
                    <button 
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={(e) => e.stopPropagation()} // Impede que o clique abra/feche a árvore
                    title="Ver requisitos de evolução"
                    >
                    <Info className="w-5 h-5" />
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content 
                    sideOffset={5}
                    className="z-50 w-72 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md border border-gray-200 dark:border-gray-700"
                    >
                    <h4 className="font-semibold text-md mb-3 text-gray-900 dark:text-white">Requisitos de Evolução</h4>
                    <EvolutionRequirements requirements={digimon.requirements} />
                    <Popover.Arrow className="fill-current text-white dark:text-gray-800"/>
                    </Popover.Content>
                </Popover.Portal>
                </Popover.Root>
            )}
      {/* Botão explícito para navegar */}
      <button
        onClick={handleNameClick} // Reutiliza o mesmo handler
        className="p-2 text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
        title={`Ver detalhes de ${digimon.name}`}
      >
        <ArrowRightCircle className="w-6 h-6" />
      </button>
    </div>
  );
}

export default TreeBranch;
