/**
 * Serviço de Favoritos e Cache Local
 * 
 * Este serviço gerencia a persistência de Digimons favoritos no localStorage
 * e fornece funcionalidades para adicionar, remover e consultar favoritos.
 */

const FAVORITES_STORAGE_KEY = 'digimon-favorites';
const CACHE_VERSION = '1.0';

/**
 * Estrutura do objeto favorito:
 * {
 *   id: number,
 *   name: string,
 *   number: string,
 *   stage: string,
 *   attribute: string,
 *   image_url: string,
 *   addedAt: string (ISO date),
 *   version: string
 * }
 */

class FavoritesService {
  constructor() {
    this.storageKey = FAVORITES_STORAGE_KEY;
    this.version = CACHE_VERSION;
    this.initializeStorage();
  }

  /**
   * Inicializa o localStorage se não existir ou migra versões antigas
   */
  initializeStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        this.saveFavorites([]);
        return;
      }

      const data = JSON.parse(stored);
      
      // Verifica se é uma versão antiga e migra se necessário
      if (!data.version || data.version !== this.version) {
        this.migrateFavorites(data);
      }
    } catch (error) {
      console.warn('Erro ao inicializar favoritos, criando novo storage:', error);
      this.saveFavorites([]);
    }
  }

  /**
   * Migra favoritos de versões antigas
   */
  migrateFavorites(oldData) {
    try {
      let favorites = [];
      
      // Se oldData é um array (versão muito antiga)
      if (Array.isArray(oldData)) {
        favorites = oldData.map(fav => ({
          ...fav,
          addedAt: fav.addedAt || new Date().toISOString(),
          version: this.version
        }));
      } 
      // Se oldData é um objeto mas versão diferente
      else if (oldData.favorites) {
        favorites = oldData.favorites.map(fav => ({
          ...fav,
          addedAt: fav.addedAt || new Date().toISOString(),
          version: this.version
        }));
      }

      this.saveFavorites(favorites);
      console.log(`Favoritos migrados para versão ${this.version}`);
    } catch (error) {
      console.error('Erro na migração de favoritos:', error);
      this.saveFavorites([]);
    }
  }

  /**
   * Salva a lista de favoritos no localStorage
   */
  saveFavorites(favorites) {
    try {
      const data = {
        favorites,
        version: this.version,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
      throw new Error('Não foi possível salvar os favoritos');
    }
  }

  /**
   * Carrega a lista de favoritos do localStorage
   */
  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const data = JSON.parse(stored);
      return data.favorites || [];
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  }

  /**
   * Adiciona um Digimon aos favoritos
   */
  addFavorite(digimon) {
    try {
      const favorites = this.loadFavorites();
      
      // Verifica se já existe
      if (this.isFavorite(digimon.id)) {
        return { success: false, message: 'Digimon já está nos favoritos' };
      }

      // Cria o objeto favorito com dados essenciais
      const favorite = {
        id: digimon.id,
        name: digimon.name,
        number: digimon.number,
        stage: digimon.stage,
        attribute: digimon.attribute,
        image_url: digimon.image_url,
        addedAt: new Date().toISOString(),
        version: this.version
      };

      favorites.push(favorite);
      this.saveFavorites(favorites);

      return { 
        success: true, 
        message: `${digimon.name} adicionado aos favoritos`,
        favorite 
      };
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return { success: false, message: 'Erro ao adicionar aos favoritos' };
    }
  }

  /**
   * Remove um Digimon dos favoritos
   */
  removeFavorite(digimonId) {
    try {
      const favorites = this.loadFavorites();
      const initialLength = favorites.length;
      
      const filteredFavorites = favorites.filter(fav => fav.id !== digimonId);
      
      if (filteredFavorites.length === initialLength) {
        return { success: false, message: 'Digimon não encontrado nos favoritos' };
      }

      this.saveFavorites(filteredFavorites);

      return { 
        success: true, 
        message: 'Digimon removido dos favoritos',
        removedId: digimonId 
      };
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return { success: false, message: 'Erro ao remover dos favoritos' };
    }
  }

  /**
   * Verifica se um Digimon é favorito
   */
  isFavorite(digimonId) {
    try {
      const favorites = this.loadFavorites();
      return favorites.some(fav => fav.id === digimonId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  }

  /**
   * Obtém todos os favoritos
   */
  getAllFavorites() {
    return this.loadFavorites();
  }

  /**
   * Obtém a contagem de favoritos
   */
  getFavoritesCount() {
    return this.loadFavorites().length;
  }

  /**
   * Obtém favoritos ordenados por data de adição (mais recentes primeiro)
   */
  getFavoritesSortedByDate() {
    const favorites = this.loadFavorites();
    return favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }

  /**
   * Obtém favoritos ordenados por nome
   */
  getFavoritesSortedByName() {
    const favorites = this.loadFavorites();
    return favorites.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtém favoritos filtrados por stage
   */
  getFavoritesByStage(stage) {
    const favorites = this.loadFavorites();
    return favorites.filter(fav => fav.stage === stage);
  }

  /**
   * Busca favoritos por nome
   */
  searchFavorites(query) {
    if (!query || query.length < 2) return [];
    
    const favorites = this.loadFavorites();
    const lowerQuery = query.toLowerCase();
    
    return favorites.filter(fav => 
      fav.name.toLowerCase().includes(lowerQuery) ||
      fav.number.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Limpa todos os favoritos (com confirmação)
   */
  clearAllFavorites() {
    try {
      this.saveFavorites([]);
      return { success: true, message: 'Todos os favoritos foram removidos' };
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return { success: false, message: 'Erro ao limpar favoritos' };
    }
  }

  /**
   * Exporta favoritos como JSON
   */
  exportFavorites() {
    try {
      const data = {
        favorites: this.loadFavorites(),
        exportedAt: new Date().toISOString(),
        version: this.version
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erro ao exportar favoritos:', error);
      return null;
    }
  }

  /**
   * Importa favoritos de JSON
   */
  importFavorites(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.favorites || !Array.isArray(data.favorites)) {
        return { success: false, message: 'Formato de dados inválido' };
      }

      // Valida cada favorito
      const validFavorites = data.favorites.filter(fav => 
        fav.id && fav.name && fav.stage && fav.attribute
      );

      if (validFavorites.length === 0) {
        return { success: false, message: 'Nenhum favorito válido encontrado' };
      }

      // Mescla com favoritos existentes (evita duplicatas)
      const existingFavorites = this.loadFavorites();
      const existingIds = new Set(existingFavorites.map(fav => fav.id));
      
      const newFavorites = validFavorites.filter(fav => !existingIds.has(fav.id));
      const mergedFavorites = [...existingFavorites, ...newFavorites];

      this.saveFavorites(mergedFavorites);

      return { 
        success: true, 
        message: `${newFavorites.length} favoritos importados com sucesso`,
        imported: newFavorites.length,
        total: mergedFavorites.length
      };
    } catch (error) {
      console.error('Erro ao importar favoritos:', error);
      return { success: false, message: 'Erro ao importar favoritos' };
    }
  }

  /**
   * Obtém estatísticas dos favoritos
   */
  getFavoritesStats() {
    const favorites = this.loadFavorites();
    
    if (favorites.length === 0) {
      return {
        total: 0,
        byStage: {},
        byAttribute: {},
        oldestFavorite: null,
        newestFavorite: null
      };
    }

    // Agrupa por stage
    const byStage = favorites.reduce((acc, fav) => {
      acc[fav.stage] = (acc[fav.stage] || 0) + 1;
      return acc;
    }, {});

    // Agrupa por attribute
    const byAttribute = favorites.reduce((acc, fav) => {
      acc[fav.attribute] = (acc[fav.attribute] || 0) + 1;
      return acc;
    }, {});

    // Encontra o mais antigo e mais novo
    const sortedByDate = favorites.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    
    return {
      total: favorites.length,
      byStage,
      byAttribute,
      oldestFavorite: sortedByDate[0],
      newestFavorite: sortedByDate[sortedByDate.length - 1]
    };
  }
}

// Instância singleton do serviço
const favoritesService = new FavoritesService();

export default favoritesService;
