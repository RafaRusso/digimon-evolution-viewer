/**
 * Serviço de Teams e Cache Local
 * 
 * Este serviço gerencia a persistência de times de Digimons no localStorage
 * e fornece funcionalidades para criar, editar, remover e consultar times.
 */

const TEAMS_STORAGE_KEY = 'digimon-teams';
const CACHE_VERSION = '1.0';

/**
 * Estrutura de um time:
 * {
 *   id: string (UUID),
 *   name: string,
 *   description?: string,
 *   starters: Array<DigimonSlot>, // 3 Digimons titulares
 *   reserves: Array<DigimonSlot>, // 3 Digimons reservas
 *   createdAt: string (ISO date),
 *   updatedAt: string (ISO date),
 *   version: string
 * }
 * 
 * Estrutura de um DigimonSlot:
 * {
 *   id: string, // ID do Digimon
 *   name: string,
 *   number: number,
 *   stage: string,
 *   attribute: string,
 *   image_url: string,
 *   stats?: object, // Stats do Digimon se disponível
 *   position: number // Posição no time (0-2 para starters, 0-2 para reserves)
 * }
 */

class TeamService {
  constructor() {
    this.storageKey = TEAMS_STORAGE_KEY;
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
        this.saveTeams([]);
        return;
      }

      const data = JSON.parse(stored);
      
      // Verifica se é uma versão antiga e migra se necessário
      if (!data.version || data.version !== this.version) {
        this.migrateTeams(data);
      }
    } catch (error) {
      console.warn('Erro ao inicializar teams, criando novo storage:', error);
      this.saveTeams([]);
    }
  }

  /**
   * Migra teams de versões antigas
   */
  migrateTeams(oldData) {
    try {
      let teams = [];
      
      // Se oldData é um array (versão muito antiga)
      if (Array.isArray(oldData)) {
        teams = oldData.map(team => ({
          ...team,
          createdAt: team.createdAt || new Date().toISOString(),
          updatedAt: team.updatedAt || new Date().toISOString(),
          version: this.version
        }));
      } 
      // Se oldData é um objeto mas versão diferente
      else if (oldData.teams) {
        teams = oldData.teams.map(team => ({
          ...team,
          createdAt: team.createdAt || new Date().toISOString(),
          updatedAt: team.updatedAt || new Date().toISOString(),
          version: this.version
        }));
      }

      this.saveTeams(teams);
      console.log(`Teams migrados para versão ${this.version}`);
    } catch (error) {
      console.error('Erro na migração de teams:', error);
      this.saveTeams([]);
    }
  }

  /**
   * Salva a lista de teams no localStorage
   */
  saveTeams(teams) {
    try {
      const data = {
        teams,
        version: this.version,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar teams:', error);
      throw new Error('Não foi possível salvar os times');
    }
  }

  /**
   * Carrega a lista de teams do localStorage
   */
  loadTeams() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const data = JSON.parse(stored);
      return data.teams || [];
    } catch (error) {
      console.error('Erro ao carregar teams:', error);
      return [];
    }
  }

  /**
   * Gera um ID único para um novo time
   */
  generateTeamId() {
    return 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cria um novo time vazio
   */
  createEmptyTeam(name, description = '') {
    return {
      id: this.generateTeamId(),
      name: name.trim(),
      description: description.trim(),
      starters: [null, null, null], // 3 slots vazios para titulares
      reserves: [null, null, null], // 3 slots vazios para reservas
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: this.version
    };
  }

  /**
   * Adiciona um novo time
   */
  addTeam(name, description = '') {
    try {
      const teams = this.loadTeams();
      
      // Verifica se já existe um time com o mesmo nome
      if (teams.some(team => team.name.toLowerCase() === name.toLowerCase().trim())) {
        return { success: false, message: 'Já existe um time com este nome' };
      }

      const newTeam = this.createEmptyTeam(name, description);
      teams.push(newTeam);
      this.saveTeams(teams);

      return { 
        success: true, 
        message: `Time "${name}" criado com sucesso`,
        team: newTeam 
      };
    } catch (error) {
      console.error('Erro ao adicionar team:', error);
      return { success: false, message: 'Erro ao criar o time' };
    }
  }

  /**
   * Atualiza um time existente
   */
  updateTeam(teamId, updates) {
    try {
      const teams = this.loadTeams();
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        return { success: false, message: 'Time não encontrado' };
      }

      // Atualiza o time
      teams[teamIndex] = {
        ...teams[teamIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveTeams(teams);

      return { 
        success: true, 
        message: 'Time atualizado com sucesso',
        team: teams[teamIndex] 
      };
    } catch (error) {
      console.error('Erro ao atualizar team:', error);
      return { success: false, message: 'Erro ao atualizar o time' };
    }
  }

  /**
   * Remove um time
   */
  removeTeam(teamId) {
    try {
      const teams = this.loadTeams();
      const initialLength = teams.length;
      
      const filteredTeams = teams.filter(team => team.id !== teamId);
      
      if (filteredTeams.length === initialLength) {
        return { success: false, message: 'Time não encontrado' };
      }

      this.saveTeams(filteredTeams);

      return { 
        success: true, 
        message: 'Time removido com sucesso',
        removedId: teamId 
      };
    } catch (error) {
      console.error('Erro ao remover team:', error);
      return { success: false, message: 'Erro ao remover o time' };
    }
  }

  /**
   * Obtém um time por ID
   */
  getTeamById(teamId) {
    try {
      const teams = this.loadTeams();
      return teams.find(team => team.id === teamId) || null;
    } catch (error) {
      console.error('Erro ao buscar team:', error);
      return null;
    }
  }

  /**
   * Obtém todos os teams
   */
  getAllTeams() {
    return this.loadTeams();
  }

  /**
   * Obtém a contagem de teams
   */
  getTeamsCount() {
    return this.loadTeams().length;
  }

  /**
   * Adiciona um Digimon a um slot específico do time
   */
  addDigimonToTeam(teamId, digimon, slotType, position) {
    try {
      const teams = this.loadTeams();
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        return { success: false, message: 'Time não encontrado' };
      }

      // Valida o tipo de slot e posição
      if (!['starters', 'reserves'].includes(slotType)) {
        return { success: false, message: 'Tipo de slot inválido' };
      }

      if (position < 0 || position > 2) {
        return { success: false, message: 'Posição inválida' };
      }

      // Cria o slot do Digimon
      const digimonSlot = {
        id: digimon.id,
        name: digimon.name,
        number: digimon.number,
        stage: digimon.stage,
        attribute: digimon.attribute,
        image_url: digimon.image_url,
        stats: digimon.stats || null,
        position: position
      };

      // Adiciona ao slot
      team[slotType][position] = digimonSlot;
      team.updatedAt = new Date().toISOString();

      this.saveTeams(teams);

      return { 
        success: true, 
        message: `${digimon.name} adicionado ao time`,
        team: team 
      };
    } catch (error) {
      console.error('Erro ao adicionar Digimon ao team:', error);
      return { success: false, message: 'Erro ao adicionar Digimon ao time' };
    }
  }

  /**
   * Remove um Digimon de um slot específico do time
   */
  removeDigimonFromTeam(teamId, slotType, position) {
    try {
      const teams = this.loadTeams();
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        return { success: false, message: 'Time não encontrado' };
      }

      if (!['starters', 'reserves'].includes(slotType)) {
        return { success: false, message: 'Tipo de slot inválido' };
      }

      if (position < 0 || position > 2) {
        return { success: false, message: 'Posição inválida' };
      }

      // Remove do slot
      team[slotType][position] = null;
      team.updatedAt = new Date().toISOString();

      this.saveTeams(teams);

      return { 
        success: true, 
        message: 'Digimon removido do time',
        team: team 
      };
    } catch (error) {
      console.error('Erro ao remover Digimon do team:', error);
      return { success: false, message: 'Erro ao remover Digimon do time' };
    }
  }

  /**
   * Move um Digimon entre slots
   */
  moveDigimonInTeam(teamId, fromSlotType, fromPosition, toSlotType, toPosition) {
    try {
      const teams = this.loadTeams();
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        return { success: false, message: 'Time não encontrado' };
      }

      // Valida slots e posições
      if (!['starters', 'reserves'].includes(fromSlotType) || !['starters', 'reserves'].includes(toSlotType)) {
        return { success: false, message: 'Tipo de slot inválido' };
      }

      if (fromPosition < 0 || fromPosition > 2 || toPosition < 0 || toPosition > 2) {
        return { success: false, message: 'Posição inválida' };
      }

      // Pega o Digimon de origem
      const digimon = team[fromSlotType][fromPosition];
      if (!digimon) {
        return { success: false, message: 'Nenhum Digimon encontrado na posição de origem' };
      }

      // Pega o Digimon de destino (pode ser null)
      const targetDigimon = team[toSlotType][toPosition];

      // Faz a troca
      team[fromSlotType][fromPosition] = targetDigimon;
      team[toSlotType][toPosition] = { ...digimon, position: toPosition };

      // Atualiza posição do Digimon de destino se existir
      if (targetDigimon) {
        targetDigimon.position = fromPosition;
      }

      team.updatedAt = new Date().toISOString();
      this.saveTeams(teams);

      return { 
        success: true, 
        message: 'Digimon movido com sucesso',
        team: team 
      };
    } catch (error) {
      console.error('Erro ao mover Digimon no team:', error);
      return { success: false, message: 'Erro ao mover Digimon' };
    }
  }

  /**
   * Obtém análise de tipagens do time
   */
  getTeamTypeAnalysis(team) {
    if (!team) return null;

    const allDigimons = [...team.starters, ...team.reserves].filter(Boolean);
    
    if (allDigimons.length === 0) {
      return {
        total: 0,
        byAttribute: {},
        advantages: [],
        weaknesses: [],
        balance: 'empty'
      };
    }

    // Conta por atributo
    const byAttribute = allDigimons.reduce((acc, digimon) => {
      acc[digimon.attribute] = (acc[digimon.attribute] || 0) + 1;
      return acc;
    }, {});

    // Analisa vantagens e fraquezas baseado no sistema Data > Vaccine > Virus > Data
    const typeAdvantages = {
      'Data': { beats: 'Vaccine', weakTo: 'Virus' },
      'Vaccine': { beats: 'Virus', weakTo: 'Data' },
      'Virus': { beats: 'Data', weakTo: 'Vaccine' }
    };

    const advantages = [];
    const weaknesses = [];

    Object.entries(byAttribute).forEach(([attribute, count]) => {
      if (typeAdvantages[attribute]) {
        advantages.push({
          attribute,
          count,
          beats: typeAdvantages[attribute].beats
        });
        weaknesses.push({
          attribute,
          count,
          weakTo: typeAdvantages[attribute].weakTo
        });
      }
    });

    // Determina o equilíbrio do time
    let balance = 'balanced';
    const attributeCount = Object.keys(byAttribute).length;
    const maxCount = Math.max(...Object.values(byAttribute));
    
    if (attributeCount === 1) {
      balance = 'mono-type';
    } else if (maxCount >= allDigimons.length * 0.7) {
      balance = 'heavily-skewed';
    } else if (attributeCount >= 3) {
      balance = 'diverse';
    }

    return {
      total: allDigimons.length,
      byAttribute,
      advantages,
      weaknesses,
      balance
    };
  }

  /**
   * Limpa todos os teams (com confirmação)
   */
  clearAllTeams() {
    try {
      this.saveTeams([]);
      return { success: true, message: 'Todos os times foram removidos' };
    } catch (error) {
      console.error('Erro ao limpar teams:', error);
      return { success: false, message: 'Erro ao limpar times' };
    }
  }

  /**
   * Exporta teams como JSON
   */
  exportTeams() {
    try {
      const data = {
        teams: this.loadTeams(),
        exportedAt: new Date().toISOString(),
        version: this.version
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erro ao exportar teams:', error);
      return null;
    }
  }

  /**
   * Importa teams de JSON
   */
  importTeams(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.teams || !Array.isArray(data.teams)) {
        return { success: false, message: 'Formato de dados inválido' };
      }

      // Valida cada time
      const validTeams = data.teams.filter(team => 
        team.id && team.name && team.starters && team.reserves
      );

      if (validTeams.length === 0) {
        return { success: false, message: 'Nenhum time válido encontrado' };
      }

      // Mescla com times existentes (evita duplicatas por ID)
      const existingTeams = this.loadTeams();
      const existingIds = new Set(existingTeams.map(team => team.id));
      
      const newTeams = validTeams.filter(team => !existingIds.has(team.id));
      const mergedTeams = [...existingTeams, ...newTeams];

      this.saveTeams(mergedTeams);

      return { 
        success: true, 
        message: `${newTeams.length} times importados com sucesso`,
        imported: newTeams.length,
        total: mergedTeams.length
      };
    } catch (error) {
      console.error('Erro ao importar teams:', error);
      return { success: false, message: 'Erro ao importar times' };
    }
  }

  /**
   * Obtém estatísticas dos teams
   */
  getTeamsStats() {
    const teams = this.loadTeams();
    
    if (teams.length === 0) {
      return {
        total: 0,
        totalDigimons: 0,
        averageTeamSize: 0,
        mostUsedAttributes: {},
        oldestTeam: null,
        newestTeam: null
      };
    }

    // Conta total de Digimons
    const totalDigimons = teams.reduce((acc, team) => {
      const teamDigimons = [...team.starters, ...team.reserves].filter(Boolean);
      return acc + teamDigimons.length;
    }, 0);

    // Conta atributos mais usados
    const mostUsedAttributes = teams.reduce((acc, team) => {
      const teamDigimons = [...team.starters, ...team.reserves].filter(Boolean);
      teamDigimons.forEach(digimon => {
        acc[digimon.attribute] = (acc[digimon.attribute] || 0) + 1;
      });
      return acc;
    }, {});

    // Encontra o mais antigo e mais novo
    const sortedByDate = teams.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return {
      total: teams.length,
      totalDigimons,
      averageTeamSize: totalDigimons / teams.length,
      mostUsedAttributes,
      oldestTeam: sortedByDate[0],
      newestTeam: sortedByDate[sortedByDate.length - 1]
    };
  }
}

// Instância singleton do serviço
const teamService = new TeamService();

export default teamService;
