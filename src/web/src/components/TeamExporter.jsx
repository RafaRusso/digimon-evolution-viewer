import React, { useState } from 'react';
import { Download, Upload, FileText, Image, Share2, Copy, Check } from 'lucide-react';
import { useTeamsImportExport } from '../hooks/useTeams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

/**
 * Componente para exportação e importação avançada de times
 * Suporta múltiplos formatos e compartilhamento
 */
export default function TeamExporter({ team, teams = [] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [shareableText, setShareableText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { exportTeams, importTeams, isExporting, isImporting } = useTeamsImportExport();

  // Gera texto compartilhável do time
  const generateShareableText = (teamData) => {
    if (!teamData) return '';

    const starters = teamData.starters.filter(Boolean);
    const reserves = teamData.reserves.filter(Boolean);

    let text = `🔥 ${teamData.name}\n`;
    if (teamData.description) {
      text += `📝 ${teamData.description}\n`;
    }
    text += '\n';

    if (starters.length > 0) {
      text += '⚔️ TITULARES:\n';
      starters.forEach((digimon, index) => {
        text += `${index + 1}. ${digimon.name} (${digimon.attribute} - ${digimon.stage})\n`;
        if (digimon.stats) {
          text += `   HP: ${digimon.stats.hp} | ATK: ${digimon.stats.atk} | DEF: ${digimon.stats.def}\n`;
        }
      });
      text += '\n';
    }

    if (reserves.length > 0) {
      text += '🛡️ RESERVAS:\n';
      reserves.forEach((digimon, index) => {
        text += `${index + 1}. ${digimon.name} (${digimon.attribute} - ${digimon.stage})\n`;
        if (digimon.stats) {
          text += `   HP: ${digimon.stats.hp} | ATK: ${digimon.stats.atk} | DEF: ${digimon.stats.def}\n`;
        }
      });
    }

    text += '\n🎮 Criado com Digimon Team Builder';
    return text;
  };

  // Gera dados para exportação em diferentes formatos
  const generateExportData = (format, teamData) => {
    switch (format) {
      case 'json':
        return JSON.stringify(teamData, null, 2);
      
      case 'csv':
        const allDigimons = [...teamData.starters, ...teamData.reserves].filter(Boolean);
        let csv = 'Nome,Atributo,Estagio,Tipo,HP,SP,ATK,DEF,INT,SPD\n';
        allDigimons.forEach(digimon => {
          const stats = digimon.stats || {};
          csv += `"${digimon.name}","${digimon.attribute}","${digimon.stage}","${digimon.position < 3 ? 'Titular' : 'Reserva'}",${stats.hp || 0},${stats.sp || 0},${stats.atk || 0},${stats.def || 0},${stats.int || 0},${stats.spd || 0}\n`;
        });
        return csv;
      
      case 'text':
        return generateShareableText(teamData);
      
      default:
        return JSON.stringify(teamData, null, 2);
    }
  };

  const handleExportSingle = (format) => {
    if (!team) return;

    const data = generateExportData(format, team);
    const extensions = { json: 'json', csv: 'csv', text: 'txt' };
    const mimeTypes = { 
      json: 'application/json', 
      csv: 'text/csv', 
      text: 'text/plain' 
    };

    const blob = new Blob([data], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Time exportado como ${format.toUpperCase()}`);
  };

  const handleCopyShareableText = async () => {
    if (!team) return;

    const text = generateShareableText(team);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Texto copiado para a área de transferência!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar texto');
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target.result;
        importTeams(jsonData);
        setIsDialogOpen(false);
      } catch (error) {
        toast.error('Erro ao ler arquivo');
      }
    };
    reader.readAsText(file);
    
    // Limpa o input
    event.target.value = '';
  };

  const getTeamStats = (teamData) => {
    if (!teamData) return null;

    const allDigimons = [...teamData.starters, ...teamData.reserves].filter(Boolean);
    const attributeCount = allDigimons.reduce((acc, digimon) => {
      acc[digimon.attribute] = (acc[digimon.attribute] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allDigimons.length,
      starters: teamData.starters.filter(Boolean).length,
      reserves: teamData.reserves.filter(Boolean).length,
      attributes: attributeCount
    };
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

  const teamStats = getTeamStats(team);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!team}>
          <Share2 className="w-4 h-4 mr-2" />
          Exportar/Compartilhar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar e Compartilhar Time</DialogTitle>
          <DialogDescription>
            Exporte seu time em diferentes formatos ou compartilhe com outros jogadores
          </DialogDescription>
        </DialogHeader>

        {team && (
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Exportar</TabsTrigger>
              <TabsTrigger value="share">Compartilhar</TabsTrigger>
              <TabsTrigger value="import">Importar</TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {team.description && (
                    <CardDescription>{team.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {teamStats && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          {teamStats.total}/6 Digimons
                        </span>
                        <span className="text-red-400">
                          {teamStats.starters} Titulares
                        </span>
                        <span className="text-blue-400">
                          {teamStats.reserves} Reservas
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(teamStats.attributes).map(([attribute, count]) => (
                          <Badge
                            key={attribute}
                            className={`${getAttributeColor(attribute)} text-white text-xs`}
                          >
                            {attribute} {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Label>Formato de Exportação</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle('json')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-400">Dados estruturados</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle('csv')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-gray-400">Planilha</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle('text')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">TXT</div>
                      <div className="text-xs text-gray-400">Texto simples</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={exportTeams}
                  disabled={isExporting || teams.length === 0}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exportando...' : 'Exportar Todos os Times'}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Exporta todos os seus times em um único arquivo JSON
                </p>
              </div>
            </TabsContent>

            {/* Share Tab */}
            <TabsContent value="share" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compartilhar Time</CardTitle>
                  <CardDescription>
                    Copie o texto abaixo para compartilhar seu time em redes sociais ou fóruns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={generateShareableText(team)}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                  />
                  
                  <Button
                    onClick={handleCopyShareableText}
                    className="w-full"
                    variant={isCopied ? "default" : "outline"}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Texto
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Importar Times</CardTitle>
                  <CardDescription>
                    Importe times de arquivos JSON exportados anteriormente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Apenas arquivos JSON exportados pelo Digimon Team Builder são suportados.
                      Times duplicados serão ignorados automaticamente.
                    </AlertDescription>
                  </Alert>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isImporting}
                    />
                    <Button
                      variant="outline"
                      disabled={isImporting}
                      className="w-full h-20 border-dashed border-2 hover:border-blue-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium">
                            {isImporting ? 'Importando...' : 'Clique para selecionar arquivo'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Ou arraste e solte aqui
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Formatos suportados: .json</p>
                    <p>• Times com mesmo ID serão ignorados</p>
                    <p>• Backup recomendado antes da importação</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
