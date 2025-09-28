import React from 'react';
import { Star, StarOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useIsFavorite, useToggleFavorite } from '../hooks/useFavorites';

/**
 * Componente de botão de favorito reutilizável
 * 
 * Pode ser usado em diferentes tamanhos e estilos:
 * - Como ícone pequeno nos cards
 * - Como botão maior nas páginas de detalhes
 * - Com ou sem texto
 */

export function FavoriteButton({ 
  digimon, 
  size = 'default', 
  variant = 'ghost',
  showText = false,
  className = '',
  iconOnly = false,
  ...props 
}) {
  const { data: isFavorite, isLoading: isCheckingFavorite } = useIsFavorite(digimon?.id);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = (e) => {
    e.stopPropagation(); // Evita que o clique no botão acione o clique do card
    if (digimon && !toggleFavorite.isPending) {
      toggleFavorite.mutate(digimon);
    }
  };

  // Estados de loading
  const isLoading = isCheckingFavorite || toggleFavorite.isPending;

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      button: 'h-8 w-8',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    default: {
      button: 'h-9 w-9',
      icon: 'h-4 w-4',
      text: 'text-sm'
    },
    lg: {
      button: 'h-10 w-10',
      icon: 'h-5 w-5',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  // Se não há digimon, não renderiza nada
  if (!digimon) return null;

  // Ícone baseado no estado
  const IconComponent = isLoading ? Loader2 : (isFavorite ? Star : StarOff);
  const iconProps = {
    className: `${config.icon} ${isLoading ? 'animate-spin' : ''} transition-all duration-200`,
    ...(isLoading ? {} : {})
  };

  // Classes do botão
  const buttonClasses = `
    ${iconOnly ? config.button : 'px-3 py-2'}
    ${className}
    transition-all duration-200
    ${isFavorite 
      ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
      : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400'
    }
    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
  `.trim();

  // Tooltip text
  const tooltipText = isLoading 
    ? 'Processando...' 
    : isFavorite 
      ? `Remover ${digimon.name} dos favoritos` 
      : `Adicionar ${digimon.name} aos favoritos`;

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        className={buttonClasses}
        onClick={handleToggle}
        disabled={isLoading}
        title={tooltipText}
        {...props}
      >
        <IconComponent {...iconProps} />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      className={buttonClasses}
      onClick={handleToggle}
      disabled={isLoading}
      title={tooltipText}
      {...props}
    >
      <IconComponent {...iconProps} />
      {showText && (
        <span className={`ml-2 ${config.text}`}>
          {isLoading ? 'Processando...' : isFavorite ? 'Favorito' : 'Favoritar'}
        </span>
      )}
    </Button>
  );
}

/**
 * Variante compacta para usar em cards pequenos
 */
export function CompactFavoriteButton({ digimon, className = '', ...props }) {
  return (
    <FavoriteButton
      digimon={digimon}
      size="sm"
      variant="ghost"
      iconOnly={true}
      className={`absolute top-2 right-2 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm ${className}`}
      {...props}
    />
  );
}

/**
 * Variante para usar em páginas de detalhes
 */
export function DetailFavoriteButton({ digimon, className = '', ...props }) {
  return (
    <FavoriteButton
      digimon={digimon}
      size="lg"
      variant="outline"
      showText={true}
      className={`border-2 ${className}`}
      {...props}
    />
  );
}

/**
 * Variante para usar em listas com texto
 */
export function ListFavoriteButton({ digimon, className = '', ...props }) {
  return (
    <FavoriteButton
      digimon={digimon}
      size="default"
      variant="ghost"
      showText={true}
      className={className}
      {...props}
    />
  );
}

export default FavoriteButton;
