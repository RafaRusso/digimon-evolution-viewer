import React from 'react';
import TreeNode from './TreeNode';

function EvolutionTree({ treeData, onDigimonSelect, onImageClick }) {
  if (!treeData || treeData.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
        Nenhum dado para exibir na árvore.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {treeData.map((rootNode) => (
        <TreeNode
          key={rootNode.id}
          node={rootNode}
          onDigimonSelect={onDigimonSelect}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

export default EvolutionTree;
