import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Search, Grid3X3, TreePine, X } from 'lucide-react'
import { Button } from './components/ui/button'
import DigimonSearch from './components/DigimonSearch'
import DigimonList from './components/DigimonList'
import EvolutionView from './components/EvolutionView'
import ApiStatus from './components/ApiStatus'
import './App.css'

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})

function AppContent() {
  const [currentView, setCurrentView] = useState('search') // 'search', 'list', 'evolution'
  const [selectedDigimon, setSelectedDigimon] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleDigimonSelect = (digimon) => {
    setSelectedDigimon(digimon)
    setCurrentView('evolution')
  }

  const openImagePreview = (digimon) => {
    if (digimon.imageUrl) {
      setImagePreview({
        url: digimon.imageUrl,
        alt: digimon.name
      })
    }
  }

  const closeImagePreview = () => setImagePreview(null)

  return (
    <div className="min-h-screen digimon-bg">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digimon Evolution
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enciclopédia completa de evoluções
              </p>
            </div>
            
            {/* Status da API */}
            <ApiStatus />
          </div>
          
          {/* Navegação */}
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant={currentView === 'search' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentView === 'search' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Search className="w-5 h-5" />
              Buscar
            </Button>
            
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('list')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentView === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
              Listar Todos
            </Button>
            
            {selectedDigimon && (
              <Button
                variant={currentView === 'evolution' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('evolution')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'evolution' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <TreePine className="w-5 h-5" />
                {selectedDigimon.name}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'search' && (
          <DigimonSearch 
            onDigimonSelect={handleDigimonSelect}
            onImagePreview={openImagePreview}
          />
        )}

        {currentView === 'list' && (
          <DigimonList 
            onDigimonSelect={handleDigimonSelect}
            onImagePreview={openImagePreview}
          />
        )}

        {currentView === 'evolution' && selectedDigimon && (
          <EvolutionView 
            digimon={selectedDigimon}
            onDigimonSelect={handleDigimonSelect}
            onImagePreview={openImagePreview}
          />
        )}
      </main>

      {/* Modal de preview de imagem */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-full bg-gray-900/70 rounded-xl border border-white/10 p-4">
            <button
              onClick={closeImagePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="text-center text-white font-semibold mb-3">
              {imagePreview.alt}
            </div>
            <img
              src={imagePreview.url}
              alt={imagePreview.alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
