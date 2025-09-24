import React, { useState, useMemo } from 'react';
import digimonData from './assets/digimon_data.json';

const DigimonEvolutionViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDigimon, setSelectedDigimon] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  // Função para obter requisitos de um Digimon
  const getDigimonRequirements = (digimonName) => {
    return digimonData.digimon_requirements?.[digimonName] || null;
  };

  // Componente para mostrar requisitos
  const RequirementsDisplay = ({ requirements }) => {
    if (!requirements) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 Requisitos para Evolução:</h4>
        
        {requirements.stats && (
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600">⚡ Stats:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {requirements.stats.map((stat, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {stat.description}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {requirements.other && (
          <div>
            <span className="text-xs font-medium text-purple-600">⭐ Outros:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {requirements.other.map((req, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {req.description}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Função para buscar Digimons
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return Object.entries(digimonData.digimons)
      .filter(([name]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        ...data,
        requirements: getDigimonRequirements(name)
      }));
  }, [searchTerm]);

  // Função para obter evoluções com requisitos
  const getEvolutionsWithRequirements = (digimonName) => {
    const evolutions = digimonData.evolutions[digimonName] || [];
    return evolutions.map(evolutionName => ({
      name: evolutionName,
      ...digimonData.digimons[evolutionName],
      requirements: getDigimonRequirements(evolutionName)
    }));
  };

  // Função para obter pré-evoluções
  const getPreEvolutions = (digimonName) => {
    const preEvolutions = digimonData.pre_evolutions[digimonName] || [];
    return preEvolutions.map(preName => ({
      name: preName,
      ...digimonData.digimons[preName]
    }));
  };

  // Função para obter linha evolutiva completa
  const getFullEvolutionLine = (digimonName) => {
    const visited = new Set();
    
    const getAllSuccessors = (name) => {
      if (visited.has(name)) return [];
      visited.add(name);
      
      const direct = digimonData.evolutions[name] || [];
      let all = [...direct];
      
      for (const successor of direct) {
        all = all.concat(getAllSuccessors(successor));
      }
      
      return [...new Set(all)];
    };
    
    return getAllSuccessors(digimonName).map(name => ({
      name,
      ...digimonData.digimons[name]
    }));
  };

  // Função para obter todos os predecessores
  const getAllPredecessors = (digimonName) => {
    const visited = new Set();
    
    const getAllPreds = (name) => {
      if (visited.has(name)) return [];
      visited.add(name);
      
      const direct = digimonData.pre_evolutions[name] || [];
      let all = [...direct];
      
      for (const pred of direct) {
        all = all.concat(getAllPreds(pred));
      }
      
      return [...new Set(all)];
    };
    
    return getAllPreds(digimonName).map(name => ({
      name,
      ...digimonData.digimons[name]
    }));
  };

  // Componente para card de Digimon
  const DigimonCard = ({ digimon, onClick, showRequirements = false }) => {
    const stageColors = {
      'I': 'border-green-300 bg-green-50',
      'II': 'border-blue-300 bg-blue-50', 
      'III': 'border-yellow-300 bg-yellow-50',
      'IV': 'border-orange-300 bg-orange-50',
      'V': 'border-red-300 bg-red-50',
      'VI': 'border-purple-300 bg-purple-50',
      'Hybrid': 'border-pink-300 bg-pink-50'
    };

    return (
      <div 
        className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${stageColors[digimon.stage] || 'border-gray-300 bg-gray-50'}`}
        onClick={() => onClick(digimon)}
      >
        <div className="flex items-center gap-3">
          {digimon.image && (
            <img 
              src={`/src/assets/images/${digimon.image}`}
              alt={digimon.name}
              className="w-12 h-12 object-cover rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{digimon.name}</h3>
            <p className="text-xs text-gray-600">
              #{digimon.number} • Stage {digimon.stage} • {digimon.attribute}
            </p>
          </div>
        </div>
        
        {showRequirements && digimon.requirements && (
          <RequirementsDisplay requirements={digimon.requirements} />
        )}
      </div>
    );
  };

  // Listar todos os Digimons por Stage
  const allDigimonsByStage = useMemo(() => {
    const stages = ['I', 'II', 'III', 'IV', 'V', 'VI', 'Hybrid'];
    const grouped = {};
    
    stages.forEach(stage => {
      grouped[stage] = Object.entries(digimonData.digimons)
        .filter(([_, data]) => data.stage === stage)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        🔥 Visualizador de Linhas Evolutivas - Digimon
      </h1>
      
      {/* Navegação por abas */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => {setActiveTab('search'); setSelectedDigimon(null);}}
        >
          🔍 Buscar
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => {setActiveTab('list'); setSelectedDigimon(null);}}
        >
          📋 Listar Todos
        </button>
        {selectedDigimon && (
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'evolution' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('evolution')}
          >
            🌟 {selectedDigimon.name}
          </button>
        )}
      </div>

      {/* Aba de Busca */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Digite o nome de um Digimon..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="grid gap-3">
              <h2 className="text-xl font-semibold text-gray-700">
                📋 Resultados da Busca ({searchResults.length})
              </h2>
              {searchResults.map((digimon) => (
                <DigimonCard
                  key={digimon.name}
                  digimon={digimon}
                  onClick={(d) => {
                    setSelectedDigimon(d);
                    setActiveTab('evolution');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba de Listagem */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {Object.entries(allDigimonsByStage).map(([stage, digimons]) => (
            digimons.length > 0 && (
              <div key={stage}>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Stage {stage} ({digimons.length} Digimons)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {digimons.map((digimon) => (
                    <DigimonCard
                      key={digimon.name}
                      digimon={digimon}
                      onClick={(d) => {
                        setSelectedDigimon(d);
                        setActiveTab('evolution');
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Aba de Evolução */}
      {activeTab === 'evolution' && selectedDigimon && (
        <div className="space-y-6">
          {/* Digimon Selecionado */}
          <div className="text-center">
            <DigimonCard 
              digimon={selectedDigimon} 
              onClick={() => {}} 
              showRequirements={true}
            />
          </div>

          {/* Evoluções Diretas */}
          {(() => {
            const evolutions = getEvolutionsWithRequirements(selectedDigimon.name);
            return evolutions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  ⬆️ Evolui Para ({evolutions.length})
                </h2>
                <div className="grid gap-3">
                  {evolutions.map((evolution) => (
                    <DigimonCard
                      key={evolution.name}
                      digimon={evolution}
                      onClick={(d) => setSelectedDigimon(d)}
                      showRequirements={true}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Pré-evoluções */}
          {(() => {
            const preEvolutions = getPreEvolutions(selectedDigimon.name);
            return preEvolutions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  ⬇️ Evolui De ({preEvolutions.length})
                </h2>
                <div className="grid gap-3">
                  {preEvolutions.map((preEvolution) => (
                    <DigimonCard
                      key={preEvolution.name}
                      digimon={preEvolution}
                      onClick={(d) => setSelectedDigimon(d)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Linha Evolutiva Completa */}
          {(() => {
            const fullLine = getFullEvolutionLine(selectedDigimon.name);
            return fullLine.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  🌟 Linha Evolutiva Futura Completa ({fullLine.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fullLine.map((digimon) => (
                    <DigimonCard
                      key={digimon.name}
                      digimon={digimon}
                      onClick={(d) => setSelectedDigimon(d)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Predecessores Completos */}
          {(() => {
            const allPreds = getAllPredecessors(selectedDigimon.name);
            return allPreds.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  🔙 Linha Evolutiva Passada Completa ({allPreds.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allPreds.map((digimon) => (
                    <DigimonCard
                      key={digimon.name}
                      digimon={digimon}
                      onClick={(d) => setSelectedDigimon(d)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default DigimonEvolutionViewer;