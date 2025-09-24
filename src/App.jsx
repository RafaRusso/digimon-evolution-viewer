import { useState, useEffect } from 'react'
import { Search, ArrowRight, ArrowLeft, Info, Zap, ImageIcon, Grid3X3, TreePine, List, ChevronRight, ChevronDown, Star, Zap as Lightning } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import digimonData from './assets/digimon_data.json'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDigimon, setSelectedDigimon] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [evolutionData, setEvolutionData] = useState(null)
  const [currentView, setCurrentView] = useState('search') // 'search', 'list', 'evolution'
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  useEffect(() => {
    setEvolutionData(digimonData)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() && evolutionData) {
      const query = searchQuery.toLowerCase()
      const results = Object.values(evolutionData.digimons)
        .filter(digimon => digimon.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10)
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

    // Evoluções diretas com requisitos
    if (evolutionData.evolutions[digimonName]) {
      result.evolves_to = evolutionData.evolutions[digimonName]
        .map(name => {
          const evoDigimon = evolutionData.digimons[name]
          if (!evoDigimon) return null
          
          // Adicionar requisitos se existirem
          const requirements = evolutionData.evolution_requirements?.[digimonName]?.[name]
          return {
            ...evoDigimon,
            requirements: requirements || null
          }
        })
        .filter(Boolean)
    }

    // Pré-evoluções diretas
    if (evolutionData.pre_evolutions[digimonName]) {
      result.evolves_from = evolutionData.pre_evolutions[digimonName]
        .map(name => evolutionData.digimons[name])
        .filter(Boolean)
    }

    // Linha evolutiva completa (recursiva)
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
    setCurrentView('evolution')
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

  // Componente para mostrar requisitos de evolução
  const EvolutionRequirements = ({ requirements }) => {
    if (!requirements) return null

    return (
      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Requisitos para Evolução:
        </div>
        <div className="space-y-1">
          {requirements.stats?.map((stat, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <Lightning className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">{stat.description}</span>
            </div>
          ))}
          {requirements.other?.map((req, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">{req.description}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Componente para card de Digimon
  const DigimonCard = ({ digimon, onClick, showFullInfo = false, showRequirements = false }) => {
    const imageUrl = getImageUrl(digimon)
    
    return (
      <button
        onClick={() => onClick(digimon)}
        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
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
        
        {showRequirements && digimon.requirements && (
          <EvolutionRequirements requirements={digimon.requirements} />
        )}
      </button>
    )
  }

  // Componente para listagem de todos os Digimons
  const DigimonList = () => {
    if (!evolutionData) return null

    const digimonsByStage = {}
    Object.values(evolutionData.digimons).forEach(digimon => {
      if (!digimonsByStage[digimon.stage]) {
        digimonsByStage[digimon.stage] = []
      }
      digimonsByStage[digimon.stage].push(digimon)
    })

    // Ordenar stages
    const stageOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'Human Hybrid', 'Beast Hybrid']
    const sortedStages = stageOrder.filter(stage => digimonsByStage[stage])

    return (
      <div className="space-y-6">
        {sortedStages.map(stage => (
          <Card key={stage}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getStageColor(stage)}>
                  Stage {stage}
                </Badge>
                <span className="text-sm text-gray-500">
                  ({digimonsByStage[stage].length} Digimons)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {digimonsByStage[stage]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(digimon => (
                    <DigimonCard
                      key={digimon.name}
                      digimon={digimon}
                      onClick={handleDigimonSelect}
                      showFullInfo={true}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Componente para árvore evolutiva
  const EvolutionTree = ({ digimonName, direction = 'successors' }) => {
    if (!evolutionData || !digimonName) return null

    const buildTree = (name, visited = new Set(), depth = 0) => {
      if (visited.has(name) || depth > 10) return null
      visited.add(name)

      const digimon = evolutionData.digimons[name]
      if (!digimon) return null

      const connections = direction === 'successors' 
        ? evolutionData.evolutions[name] || []
        : evolutionData.pre_evolutions[name] || []

      const children = connections
        .map(childName => buildTree(childName, new Set(visited), depth + 1))
        .filter(Boolean)

      return {
        digimon,
        children,
        depth
      }
    }

    const TreeNode = ({ node, isLast = false, prefix = '' }) => {
      const hasChildren = node.children.length > 0
      const nodeId = `${node.digimon.name}-${node.depth}`
      const isExpanded = expandedNodes.has(nodeId)

      const toggleExpanded = (e) => {
        e.stopPropagation()
        const newExpanded = new Set(expandedNodes)
        if (isExpanded) {
          newExpanded.delete(nodeId)
        } else {
          newExpanded.add(nodeId)
        }
        setExpandedNodes(newExpanded)
      }

      return (
        <div className="select-none">
          <div className="flex items-center gap-2 py-1">
            <span className="text-gray-400 font-mono text-sm">
              {prefix}
              {isLast ? '└─' : '├─'}
            </span>
            
            {hasChildren && (
              <button
                onClick={toggleExpanded}
                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            
            <button
              onClick={() => handleDigimonSelect(node.digimon)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
            >
              <div className="w-6 h-6 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {getImageUrl(node.digimon) ? (
                  <img 
                    src={getImageUrl(node.digimon)} 
                    alt={node.digimon.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-3 h-3 text-gray-400" />
                )}
              </div>
              
              <span className="font-medium text-gray-900 dark:text-white">
                {node.digimon.name}
              </span>
              
              <Badge className={`${getStageColor(node.digimon.stage)} text-xs`}>
                {node.digimon.stage}
              </Badge>
            </button>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {node.children.map((child, index) => (
                <TreeNode
                  key={`${child.digimon.name}-${index}`}
                  node={child}
                  isLast={index === node.children.length - 1}
                  prefix={prefix + (isLast ? '   ' : '│  ')}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    const tree = buildTree(digimonName)
    if (!tree) return null

    return (
      <div className="font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
        <TreeNode node={tree} isLast={true} />
      </div>
    )
  }

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
            Explore as evoluções completas dos Digimons com requisitos e árvore visual
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Button
              variant={currentView === 'search' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('search')}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Listar Todos
            </Button>
            {selectedDigimon && (
              <Button
                variant={currentView === 'evolution' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('evolution')}
                className="flex items-center gap-2"
              >
                <TreePine className="w-4 h-4" />
                {selectedDigimon.digimon.name}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {currentView === 'search' && (
          <div className="space-y-8">
            {/* Search Section */}
            <Card>
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

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Como usar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>1. <strong>Buscar:</strong> Digite o nome de um Digimon na barra de busca</p>
                  <p>2. <strong>Listar:</strong> Veja todos os Digimons organizados por Stage</p>
                  <p>3. <strong>Explorar:</strong> Veja evoluções, requisitos e árvore visual</p>
                  <p>4. <strong>Navegar:</strong> Clique em qualquer Digimon para continuar explorando</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'list' && <DigimonList />}

        {currentView === 'evolution' && selectedDigimon && (
          <div className="space-y-6">
            {/* Selected Digimon Info */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getImageUrl(selectedDigimon.digimon) ? (
                      <img 
                        src={getImageUrl(selectedDigimon.digimon)} 
                        alt={selectedDigimon.digimon.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
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

            {/* Tabs for different views */}
            <Tabs defaultValue="evolutions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evolutions">Evoluções</TabsTrigger>
                <TabsTrigger value="tree-successors">Árvore Futura</TabsTrigger>
                <TabsTrigger value="tree-predecessors">Árvore Passada</TabsTrigger>
              </TabsList>
              
              <TabsContent value="evolutions" className="space-y-6">
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
                        <div className="space-y-2">
                          {selectedDigimon.evolves_from.map((digimon) => (
                            <DigimonCard
                              key={digimon.name}
                              digimon={digimon}
                              onClick={handleDigimonSelect}
                            />
                          ))}
                        </div>
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
                        <div className="space-y-2">
                          {selectedDigimon.evolves_to.map((digimon) => (
                            <DigimonCard
                              key={digimon.name}
                              digimon={digimon}
                              onClick={handleDigimonSelect}
                              showRequirements={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Nenhuma evolução direta encontrada
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="tree-successors">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <TreePine className="w-5 h-5" />
                      Árvore Evolutiva - Sucessores
                    </CardTitle>
                    <CardDescription>
                      Visualização em árvore de todas as evoluções futuras possíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EvolutionTree 
                      digimonName={selectedDigimon.digimon.name} 
                      direction="successors" 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tree-predecessors">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <TreePine className="w-5 h-5" />
                      Árvore Evolutiva - Predecessores
                    </CardTitle>
                    <CardDescription>
                      Visualização em árvore de todas as pré-evoluções possíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EvolutionTree 
                      digimonName={selectedDigimon.digimon.name} 
                      direction="predecessors" 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
