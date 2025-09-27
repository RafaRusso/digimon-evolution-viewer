// Em src/components/TreeNode.jsx

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import TreeBranch from './TreeBranch';

function TreeNode({ node, onDigimonSelect, onImageClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.evolutions && node.evolutions.length > 0;

  // O único clique que este componente gerencia é o de expandir/recolher
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Linha de conexão vertical */}
      <div className="absolute left-3 top-0 h-full w-px bg-gray-300 dark:bg-gray-600/70"></div>

      {/* Container principal com Flexbox */}
      <div 
        className="flex items-center cursor-pointer"
        // O clique na área inteira (exceto nos botões internos) agora expande/recolhe
        onClick={handleToggle} 
      >
        {/* Área da Seta e da linha horizontal */}
        <div className="relative h-16 w-8 flex-shrink-0 flex items-center justify-center">
          <div className="absolute left-3 top-1/2 h-px w-full bg-gray-300 dark:bg-gray-600/70"></div>
          {hasChildren && (
            <div className="relative z-10 p-1 rounded-full bg-white dark:bg-gray-800">
              <ChevronRight 
                className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} 
              />
            </div>
          )}
        </div>

        {/* O conteúdo do nó da árvore */}
        <div className="w-full">
          <TreeBranch 
            digimon={node}
            onSelect={onDigimonSelect}
            onImageClick={onImageClick}
          />
        </div>
      </div>

      {/* Filhos */}
      {isOpen && hasChildren && (
        <div className="pl-6">
          {node.evolutions.map((childNode) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              onDigimonSelect={onDigimonSelect}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
