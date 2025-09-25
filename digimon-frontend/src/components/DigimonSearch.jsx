import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { useSearchDigimons } from '../hooks/useDigimons'
import DigimonCard from './DigimonCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export function DigimonSearch({ onDigimonSelect, onImagePreview }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce da busca para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Hook para buscar Digimons
  const { 
    data: searchResults, 
    isLoading, 
    error,
    isError 
  } = useSearchDigimons(
    debouncedQuery, 
    10, 
    debouncedQuery.length > 0
  )

  const handleDigimonSelect = (digimon) => {
    if (onDigimonSelect) {
      onDigimonSelect(digimon)
    }
    // Limpar busca após seleção
    setSearchQuery('')
    setDebouncedQuery('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Card de busca */}
      <Card className="digimon-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <Search className="w-6 h-6 text-blue-500" />
            Buscar Digimon
          </CardTitle>
          <CardDescription className="text-lg">
            Digite o nome de um Digimon para ver sua linha evolutiva completa com requisitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Ex: Agumon, Coronamon, Guilmon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resultados da busca */}
      {debouncedQuery && (
        <Card className="digimon-card">
          <CardHeader>
            <CardTitle className="text-xl">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Buscando...
                </div>
              ) : isError ? (
                'Erro na busca'
              ) : (
                `Resultados da Busca (${searchResults?.data?.length || 0})`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {isError && (
              <ErrorMessage 
                message={error?.message || 'Erro ao buscar Digimons'} 
              />
            )}

            {searchResults?.data && searchResults.data.length > 0 && (
              <div className="space-y-4">
                {searchResults.data.map((digimon) => (
                  <DigimonCard
                    key={digimon.id}
                    digimon={digimon}
                    onClick={handleDigimonSelect}
                    onImageClick={onImagePreview}
                  />
                ))}
              </div>
            )}

            {searchResults?.data && searchResults.data.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum Digimon encontrado para "{debouncedQuery}"
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções de uso */}
      {!debouncedQuery && (
        <Card className="digimon-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="w-6 h-6 text-blue-500" />
              Como usar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Buscar:</strong> Digite o nome de qualquer Digimon no campo acima
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Selecionar:</strong> Clique no resultado desejado para ver detalhes
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Explorar:</strong> Veja evoluções, requisitos e árvore visual completa
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Navegar:</strong> Clique em qualquer Digimon para continuar explorando
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DigimonSearch
