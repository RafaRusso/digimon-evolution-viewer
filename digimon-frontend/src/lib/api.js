import axios from 'axios'

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Criar instância do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.params)
    }
    return config
  },
  (error) => {
    console.error('Erro na requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Log do erro
    console.error('Erro na resposta:', error.response?.data || error.message)
    
    // Tratar diferentes tipos de erro
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response
      
      switch (status) {
        case 404:
          throw new Error(data.message || 'Recurso não encontrado')
        case 429:
          throw new Error('Muitas requisições. Tente novamente em alguns instantes.')
        case 500:
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.')
        default:
          throw new Error(data.message || 'Erro na requisição')
      }
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
    } else {
      // Erro na configuração da requisição
      throw new Error('Erro interno. Tente novamente.')
    }
  }
)

// Funções da API
export const digimonApi = {
  // Buscar todos os Digimons com paginação
  async getDigimons(page = 1, limit = 50, stage = null) {
    const params = { page, limit }
    if (stage) params.stage = stage
    
    const response = await api.get('/api/digimons', { params })
    return response.data
  },

  // Buscar Digimons por termo
  async searchDigimons(query, limit = 10) {
    const response = await api.get('/api/digimons/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  // Buscar Digimon por ID
  async getDigimonById(id) {
    const response = await api.get(`/api/digimons/${id}`)
    return response.data
  },

  // Buscar Digimon por nome
  async getDigimonByName(name) {
    const response = await api.get(`/api/digimons/name/${encodeURIComponent(name)}`)
    return response.data
  },

  // Buscar evoluções de um Digimon
  async getDigimonEvolutions(id) {
    const response = await api.get(`/api/digimons/${id}/evolutions`)
    return response.data
  },

  // Buscar linha evolutiva completa
  async getEvolutionLine(id) {
    const response = await api.get(`/api/digimons/${id}/evolution-line`)
    return response.data
  },

  // Buscar linha evolutiva por nome
  async getEvolutionLineByName(name) {
    const response = await api.get(`/api/digimons/name/${encodeURIComponent(name)}/evolution-line`)
    return response.data
  },

  // Buscar estatísticas
  async getStats() {
    const response = await api.get('/api/digimons/stats')
    return response.data
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  }
}

// Utilitários
export const apiUtils = {
  // Verificar se a API está online
  async isApiOnline() {
    try {
      await digimonApi.healthCheck()
      return true
    } catch (error) {
      return false
    }
  },

  // Obter URL da imagem
  getImageUrl(filename) {
    if (!filename) return null
    return `${API_BASE_URL}/images/${filename}`
  },

  // Formatar erro para exibição
  formatError(error) {
    if (typeof error === 'string') return error
    return error.message || 'Erro desconhecido'
  }
}
