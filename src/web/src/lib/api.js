import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
console.log('API Base URL:', API_BASE_URL ) // Ótimo para depuração

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const IS_DEVELOPMENT = import.meta.env.DEV

// ... (interceptors permanecem os mesmos)
api.interceptors.request.use(/* ... */);
api.interceptors.response.use(/* ... */);


// --- FUNÇÕES DA API COMPLETAS ---
export const digimonApi = {
  // Este já estava correto
  async getDigimons(page, limit, stage = null, attribute = null, name = null) {
    const params = { page, limit }
    if (stage) params.stage = stage
    if (attribute) params.attribute = attribute
    if (name) params.q = name
    const response = await api.get('/api/digimons', { params })
    return response.data
  },

  // --- LÓGICA ADICIONADA ABAIXO ---

  async searchDigimons(query, limit = 10) {
    const response = await api.get('/api/digimons/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  async getDigimonById(id) {
    // Parâmetros de URL são passados diretamente na string
    const response = await api.get(`/api/digimons/${id}`)
    return response.data
  },

  async getDigimonByName(name) {
    // Usar encodeURIComponent é uma boa prática para nomes que podem ter espaços ou caracteres especiais
    const response = await api.get(`/api/digimons/name/${encodeURIComponent(name)}`)
    return response.data
  },

  async getDigimonEvolutions(id) {
    const response = await api.get(`/api/digimons/${id}/evolutions`)
    return response.data
  },

  async getEvolutionLine(id) {
    const response = await api.get(`/api/digimons/${id}/evolution-line`)
    return response.data
  },

  async getEvolutionLineByName(name) {
    const response = await api.get(`/api/digimons/name/${encodeURIComponent(name)}/evolution-line`)
    return response.data
  },

  async getStats() {
    const response = await api.get('/api/digimons/stats')
    return response.data
  },

  async healthCheck() {
    // Assumindo que você criará uma rota /health no seu backend
    // Se não, pode remover esta função e o hook useApiHealth
    try {
      const response = await api.get('/health')
      return response.data
    } catch {
      // Se a rota não existir, o health check vai falhar, o que é esperado.
      // Retornamos um objeto que indica o status offline.
      return { status: 'offline' }
    }
  }
}

export const apiUtils = {   // Verificar se a API está online
  async isApiOnline() {
    try {
      await digimonApi.healthCheck()
      return true
    } catch {
      return false
    }
  },
  // Formatar erro para exibição
  formatError(error) {
    if (typeof error === 'string') return error
    return error.message || 'Erro desconhecido'
  } };
