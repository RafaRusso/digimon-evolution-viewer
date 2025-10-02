import React from 'react';
import { BarChart3, Shield, Sword, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

/**
 * Componente para análise detalhada do time
 * Mostra estatísticas, vantagens/desvantagens de tipo e recomendações
 */
export default function TeamAnalysis({ team, analysis, onDigimonClick, onImageClick }) {
  if (!team) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Nenhum time selecionado
          </h3>
          <p className="text-gray-400 text-center">
            Selecione um time para ver a análise detalhada
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Time vazio
          </h3>
          <p className="text-gray-400 text-center">
            Adicione Digimons ao time para ver a análise
          </p>
        </CardContent>
      </Card>
    );
  }

  const getBalanceInfo = (balance) => {
    const balanceConfig = {
      'empty': {
        label: 'Vazio',
        description: 'Time não possui Digimons',
        color: 'text-gray-400',
        icon: Users
      },
      'mono-type': {
        label: 'Mono-tipo',
        description: 'Time focado em um único atributo',
        color: 'text-orange-400',
        icon: AlertTriangle
      },
      'heavily-skewed': {
        label: 'Desbalanceado',
        description: 'Time com forte tendência para um atributo',
        color: 'text-yellow-400',
        icon: TrendingUp
      },
      'balanced': {
        label: 'Balanceado',
        description: 'Time com boa distribuição de atributos',
        color: 'text-green-400',
        icon: CheckCircle
      },
      'diverse': {
        label: 'Diversificado',
        description: 'Time com grande variedade de atributos',
        color: 'text-blue-400',
        icon: BarChart3
      }
    };

    return balanceConfig[balance] || balanceConfig['balanced'];
  };

  const getAttributeColor = (attribute) => {
    const colors = {
      'Data': 'bg-blue-500',
      'Vaccine': 'bg-green-500',
      'Virus': 'bg-red-500',
      'N/A': 'bg-gray-500'
    };
    return colors[attribute] || 'bg-gray-500';
  };

  const balanceInfo = getBalanceInfo(analysis.balance);
  const BalanceIcon = balanceInfo.icon;

  // Calcula estatísticas do time
  const allDigimons = [...team.starters, ...team.reserves].filter(Boolean);
  const teamStats = allDigimons.reduce((acc, digimon) => {
    if (digimon.stats) {
      acc.totalHP += digimon.stats.hp;
      acc.totalSP += digimon.stats.sp;
      acc.totalATK += digimon.stats.atk;
      acc.totalDEF += digimon.stats.def;
      acc.totalINT += digimon.stats.int;
      acc.totalSPD += digimon.stats.spd;
      acc.count++;
    }
    return acc;
  }, { totalHP: 0, totalSP: 0, totalATK: 0, totalDEF: 0, totalINT: 0, totalSPD: 0, count: 0 });

  const avgStats = teamStats.count > 0 ? {
    hp: Math.round(teamStats.totalHP / teamStats.count),
    sp: Math.round(teamStats.totalSP / teamStats.count),
    atk: Math.round(teamStats.totalATK / teamStats.count),
    def: Math.round(teamStats.totalDEF / teamStats.count),
    int: Math.round(teamStats.totalINT / teamStats.count),
    spd: Math.round(teamStats.totalSPD / teamStats.count)
  } : null;

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análise do Time: {team.name}
          </CardTitle>
          <CardDescription>
            Análise detalhada de composição e estratégia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analysis.total}</div>
              <div className="text-sm text-gray-400">Digimons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{team.starters.filter(Boolean).length}</div>
              <div className="text-sm text-gray-400">Titulares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{team.reserves.filter(Boolean).length}</div>
              <div className="text-sm text-gray-400">Reservas</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${balanceInfo.color}`}>
                <BalanceIcon className="w-8 h-8 mx-auto" />
              </div>
              <div className="text-sm text-gray-400">{balanceInfo.label}</div>
            </div>
          </div>

          {/* Balance Alert */}
          <Alert>
            <BalanceIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>{balanceInfo.label}:</strong> {balanceInfo.description}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Attribute Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Distribuição de Atributos
          </CardTitle>
          <CardDescription>
            Como os atributos estão distribuídos no seu time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.byAttribute).map(([attribute, count]) => {
            const percentage = (count / analysis.total) * 100;
            return (
              <div key={attribute} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getAttributeColor(attribute)} text-white`}>
                      {attribute}
                    </Badge>
                    <span className="text-sm text-gray-300">
                      {count} Digimon{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Type Advantages */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Advantages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              Vantagens
            </CardTitle>
            <CardDescription>
              Tipos que seu time é forte contra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.advantages.length > 0 ? (
              <div className="space-y-3">
                {analysis.advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getAttributeColor(advantage.attribute)} text-white`}>
                        {advantage.attribute}
                      </Badge>
                      <span className="text-sm text-gray-300">
                        {advantage.count}x
                      </span>
                    </div>
                    <div className="text-sm text-green-400">
                      vs {advantage.beats}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Nenhuma vantagem de tipo identificada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <TrendingDown className="w-5 h-5" />
              Fraquezas
            </CardTitle>
            <CardDescription>
              Tipos que são fortes contra seu time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getAttributeColor(weakness.attribute)} text-white`}>
                        {weakness.attribute}
                      </Badge>
                      <span className="text-sm text-gray-300">
                        {weakness.count}x
                      </span>
                    </div>
                    <div className="text-sm text-red-400">
                      fraco vs {weakness.weakTo}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Nenhuma fraqueza de tipo identificada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Average Stats */}
      {avgStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Estatísticas Médias
            </CardTitle>
            <CardDescription>
              Status médios dos Digimons no time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-900/20 rounded-lg">
                <div className="text-xl font-bold text-red-400">{avgStats.hp}</div>
                <div className="text-sm text-gray-400">HP Médio</div>
              </div>
              <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                <div className="text-xl font-bold text-cyan-400">{avgStats.sp}</div>
                <div className="text-sm text-gray-400">SP Médio</div>
              </div>
              <div className="text-center p-3 bg-orange-900/20 rounded-lg">
                <div className="text-xl font-bold text-orange-400">{avgStats.atk}</div>
                <div className="text-sm text-gray-400">ATK Médio</div>
              </div>
              <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-400">{avgStats.def}</div>
                <div className="text-sm text-gray-400">DEF Médio</div>
              </div>
              <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-400">{avgStats.int}</div>
                <div className="text-sm text-gray-400">INT Médio</div>
              </div>
              <div className="text-center p-3 bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-400">{avgStats.spd}</div>
                <div className="text-sm text-gray-400">SPD Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros do Time
          </CardTitle>
          <CardDescription>
            Todos os Digimons no time atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Starters */}
            {team.starters.filter(Boolean).length > 0 && (
              <div>
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Sword className="w-4 h-4" />
                  Titulares
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {team.starters.filter(Boolean).map((digimon, index) => (
                    <div
                      key={`starter-${index}`}
                      className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => onDigimonClick?.(digimon)}
                    >
                      <div className="w-8 h-8 bg-gray-700 rounded overflow-hidden">
                        <img
                          src={digimon.image_url}
                          alt={digimon.name}
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageClick?.(digimon);
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{digimon.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getAttributeColor(digimon.attribute)} text-white text-xs`}>
                            {digimon.attribute}
                          </Badge>
                          <span className="text-xs text-gray-400">{digimon.stage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reserves */}
            {team.reserves.filter(Boolean).length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reservas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {team.reserves.filter(Boolean).map((digimon, index) => (
                    <div
                      key={`reserve-${index}`}
                      className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => onDigimonClick?.(digimon)}
                    >
                      <div className="w-8 h-8 bg-gray-700 rounded overflow-hidden">
                        <img
                          src={digimon.image_url}
                          alt={digimon.name}
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageClick?.(digimon);
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{digimon.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getAttributeColor(digimon.attribute)} text-white text-xs`}>
                            {digimon.attribute}
                          </Badge>
                          <span className="text-xs text-gray-400">{digimon.stage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
