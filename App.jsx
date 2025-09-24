import { useState, useEffect } from 'react'
import { Search, ArrowRight, ArrowLeft, Info, Zap, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import digimonData from './assets/digimon_data.json'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDigimon, setSelectedDigimon] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [evolutionData, setEvolutionData] = useState(null)

  useEffect(() => {
    // Carregar dados dos Digimons
    setEvolutionData(digimonData)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() && evolutionData) {
      const query = searchQuery.toLowerCase()
      const results = Object.values(evolutionData.digimons)
        .filter(digimon => digimon.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10) // Limitar a 10 resultados
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, evolutionData])

  const getEvolutionLine = (digimonName) => {
    if (!evolutionData) return null

    const digimon = evolutionData.digimons[digimonName]
    if (!digimon) return null

    const result = {
      digimon: digimon,
      evolves_to: [],
      evolves_from: [],
      complete_line: {
        predecessors: [],
        successors: []
      }
    }

    // Evoluções diretas
    if (evolutionData.evolutions[digimonName]) {
      result.evolves_to = evolutionData.evolutions[digimonName]
        .map(name => evolutionData.digimons[name])
        .filter(Boolean)
    }

    // Pré-evoluções diretas
    if (evolutionData.pre_evolutions[digimonName]) {
      result.evolves_from = evolutionData.pre_evolutions[digimonName]
        .map(name => evolutionData.digimons[name])
        .filter(Boolean)
    }

    // Função recursiva para obter todos os predecessores
    const getAllPredecessors = (name, visited = new Set()) => {
      if (visited.has(name)) return []
      visited.add(name)
      
      let predecessors = []
      if (evolutionData.pre_evolutions[name]) {
        for (const preName of evolutionData.pre_evolutions[name]) {
          const preDigimon = evolutionData.digimons[preName]
          if (preDigimon) {
            predecessors.push(preDigimon)
            predecessors.push(...getAllPredecessors(preName, new Set(visited)))
          }
        }
      }
      return predecessors
    }

    // Função recursiva para obter todos os sucessores
    const getAllSuccessors = (name, visited = new Set()) => {
      if (visited.has(name)) return []
      visited.add(name)
      
      let successors = []
      if (evolutionData.evolutions[name]) {
        for (const evoName of evolutionData.evolutions[name]) {
          const evoDigimon = evolutionData.digimons[evoName]
          if (evoDigimon) {
            successors.push(evoDigimon)
            successors.push(...getAllSuccessors(evoName, new Set(visited)))
          }
        }
      }
      return successors
    }

    result.complete_line.predecessors = getAllPredecessors(digimonName)
    result.complete_line.successors = getAllSuccessors(digimonName)

    return result
  }

  const handleDigimonSelect = (digimon) => {
    setSelectedDigimon(getEvolutionLine(digimon.name))
    setSearchQuery('')
    setSearchResults([])
  }

  const getStageColor = (stage) => {
    const colors = {
      'I': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'II': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'III': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'IV': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'V': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'VI': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Human Hybrid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Beast Hybrid': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getAttributeColor = (attribute) => {
    const colors = {
      'Vaccine': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'Data': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Virus': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      'Variable': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300'
    }
    return colors[attribute] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getImageUrl = (digimon) => {
    if (digimon.image) {
      try {
        return new URL(`./assets/images/${digimon.image}`, import.meta.url).href
      } catch (e) {
        return null
      }
    }
    return null
  }

  const DigimonCard = ({ digimon, onClick, showFullInfo = false }) => {
    const imageUrl = getImageUrl(digimon)
    
    return (
      <button
        onClick={() => onClick(digimon)}
        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Imagem do Digimon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={digimon.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          
          {/* Informações do Digimon */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {digimon.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>#{digimon.number}</span>
              {showFullInfo && (
                <>
                  <Badge className={`${getStageColor(digimon.stage)} text-xs`}>
                    {digimon.stage}
                  </Badge>
                  <Badge className={`${getAttributeColor(digimon.attribute)} text-xs`}>
                    {digimon.attribute}
                  </Badge>
                </>
              )}
              {!showFullInfo && (
                <span>Stage {digimon.stage} • {digimon.attribute}</span>
              )}
            </div>
          </div>
          
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </button>
    )
  }

  const DigimonGrid = ({ digimons, title, onClick, maxHeight = "max-h-96" }) => (
    <div className={`grid gap-2 ${maxHeight} overflow-y-auto`}>
      {digimons.map((digimon, index) => (
        <DigimonCard
          key={`${digimon.name}-${index}`}
          digimon={digimon}
          onClick={onClick}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Zap className="text-blue-600" />
            Visualizador de Linhas Evolutivas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore as evoluções completas dos Digimons com imagens
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Digimon
            </CardTitle>
            <CardDescription>
              Digite o nome de um Digimon para ver sua linha evolutiva completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="text"
                placeholder="Ex: Coronamon, Agumon, Gabumon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((digimon) => (
                    <DigimonCard
                      key={digimon.name}
                      digimon={digimon}
                      onClick={handleDigimonSelect}
                      showFullInfo={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evolution Display */}
        {selectedDigimon && (
          <div className="space-y-6">
            {/* Selected Digimon Info */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {/* Imagem principal */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getImageUrl(selectedDigimon.digimon) ? (
                      <img 
                        src={getImageUrl(selectedDigimon.digimon)} 
                        alt={selectedDigimon.digimon.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${getImageUrl(selectedDigimon.digimon) ? 'hidden' : ''}`}>
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Informações principais */}
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Info className="w-6 h-6 text-blue-600" />
                      {selectedDigimon.digimon.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-lg mt-2">
                      <span>#{selectedDigimon.digimon.number}</span>
                      <Badge className={getStageColor(selectedDigimon.digimon.stage)}>
                        Stage {selectedDigimon.digimon.stage}
                      </Badge>
                      <Badge className={getAttributeColor(selectedDigimon.digimon.attribute)}>
                        {selectedDigimon.digimon.attribute}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Evolution Lines */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Evolves From */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <ArrowLeft className="w-5 h-5" />
                    Evolui De ({selectedDigimon.evolves_from.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDigimon.evolves_from.length > 0 ? (
                    <DigimonGrid 
                      digimons={selectedDigimon.evolves_from}
                      onClick={handleDigimonSelect}
                      maxHeight="max-h-64"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Nenhuma pré-evolução direta encontrada
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Evolves To */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <ArrowRight className="w-5 h-5" />
                    Evolui Para ({selectedDigimon.evolves_to.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDigimon.evolves_to.length > 0 ? (
                    <DigimonGrid 
                      digimons={selectedDigimon.evolves_to}
                      onClick={handleDigimonSelect}
                      maxHeight="max-h-64"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Nenhuma evolução direta encontrada
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Complete Evolution Line */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* All Predecessors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 dark:text-purple-400">
                    Linha Evolutiva Completa - Predecessores ({selectedDigimon.complete_line.predecessors.length})
                  </CardTitle>
                  <CardDescription>
                    Todos os Digimons que podem evoluir para {selectedDigimon.digimon.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDigimon.complete_line.predecessors.length > 0 ? (
                    <DigimonGrid 
                      digimons={selectedDigimon.complete_line.predecessors}
                      onClick={handleDigimonSelect}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Nenhum predecessor encontrado
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* All Successors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600 dark:text-orange-400">
                    Linha Evolutiva Completa - Sucessores ({selectedDigimon.complete_line.successors.length})
                  </CardTitle>
                  <CardDescription>
                    Todos os Digimons que {selectedDigimon.digimon.name} pode evoluir para
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDigimon.complete_line.successors.length > 0 ? (
                    <DigimonGrid 
                      digimons={selectedDigimon.complete_line.successors}
                      onClick={handleDigimonSelect}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Nenhum sucessor encontrado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedDigimon && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Como usar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>1. Digite o nome de um Digimon na barra de busca acima</p>
                <p>2. Selecione o Digimon desejado da lista de resultados</p>
                <p>3. Explore as evoluções diretas e a linha evolutiva completa</p>
                <p>4. Clique em qualquer Digimon para navegar pela árvore evolutiva</p>
                <p>5. Veja as imagens dos Digimons para uma experiência visual completa</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
