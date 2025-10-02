import React, { useState } from 'react';
import { Plus, Trash2, Edit, Download, Upload, Users, Calendar, MoreVertical } from 'lucide-react';
import { useTeams, useTeamsImportExport } from '../hooks/useTeams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { getAssetImageUrl } from '../lib/utils';

/**
 * Componente para gerenciar a lista de times
 * Permite visualizar, editar, remover e importar/exportar times
 */
export default function TeamList({ teams, selectedTeamId, onTeamSelect, onCreateTeam }) {
  const [editingTeam, setEditingTeam] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { updateTeam, removeTeam, isUpdatingTeam, isRemovingTeam } = useTeams();
  const { exportTeams, importTeams, isExporting, isImporting } = useTeamsImportExport();

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditDescription(team.description || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTeam || !editName.trim()) return;

    updateTeam(
      { 
        teamId: editingTeam.id, 
        updates: { 
          name: editName.trim(), 
          description: editDescription.trim() 
        } 
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingTeam(null);
          setEditName('');
          setEditDescription('');
        }
      }
    );
  };

  const handleDeleteTeam = (team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!teamToDelete) return;

    removeTeam(teamToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
        // Se o time deletado era o selecionado, limpa a seleção
        if (selectedTeamId === teamToDelete.id) {
          onTeamSelect(null);
        }
      }
    });
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target.result;
        importTeams(jsonData);
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
      }
    };
    reader.readAsText(file);
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  const getTeamDigimons = (team) => {
    return [...team.starters, ...team.reserves].filter(Boolean);
  };

  const getTeamCompletion = (team) => {
    const digimons = getTeamDigimons(team);
    return (digimons.length / 6) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAttributeDistribution = (team) => {
    const digimons = getTeamDigimons(team);
    const distribution = digimons.reduce((acc, digimon) => {
      acc[digimon.attribute] = (acc[digimon.attribute] || 0) + 1;
      return acc;
    }, {});
    return distribution;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Times</h2>
          <p className="text-gray-300 mt-1">
            Gerencie seus times de Digimons salvos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Import */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button variant="outline" disabled={isImporting}>
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </div>

          {/* Export */}
          <Button 
            variant="outline" 
            onClick={exportTeams}
            disabled={isExporting || teams.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>

          {/* Create Team */}
          <Button onClick={onCreateTeam}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Time
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const digimons = getTeamDigimons(team);
            const completion = getTeamCompletion(team);
            const attributeDistribution = getAttributeDistribution(team);
            const isSelected = selectedTeamId === team.id;

            return (
              <Card
                key={team.id}
                className={`
                  cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-400
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-900/10' : ''}
                `}
                onClick={() => onTeamSelect(team.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" title={team.name}>
                        {team.name}
                      </CardTitle>
                      {team.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {team.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditTeam(team);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeam(team);
                          }}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Team Preview */}
                  <div className="grid grid-cols-6 gap-1">
                    {[...team.starters, ...team.reserves].map((digimon, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square rounded border-2 overflow-hidden
                          ${index < 3 ? 'border-red-500/30' : 'border-blue-500/30'}
                          ${digimon ? 'bg-gray-700' : 'bg-gray-800 border-dashed border-gray-600'}
                        `}
                      >
                        {digimon ? (
                          <img
                            src={getAssetImageUrl(digimon.image_url)}
                            alt={digimon.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-digimon.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-gray-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-white">{digimons.length}/6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  {/* Attribute Distribution */}
                  {Object.keys(attributeDistribution).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(attributeDistribution).map(([attribute, count]) => (
                        <Badge
                          key={attribute}
                          className={`${getAttributeColor(attribute)} text-white text-xs`}
                        >
                          {attribute} {count}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Criado em {formatDate(team.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Nenhum time criado
            </h3>
            <p className="text-gray-400 text-center mb-4">
              Crie seu primeiro time para começar a planejar suas estratégias
            </p>
            <Button onClick={onCreateTeam}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Time
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Time</DialogTitle>
            <DialogDescription>
              Altere o nome e descrição do time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-team-name">Nome do Time</Label>
              <Input
                id="edit-team-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do time"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="edit-team-description">Descrição</Label>
              <Textarea
                id="edit-team-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição do time..."
                maxLength={200}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || isUpdatingTeam}
              >
                {isUpdatingTeam ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Time</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o time "{teamToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              Esta ação não pode ser desfeita. O time será permanentemente removido.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isRemovingTeam}
            >
              {isRemovingTeam ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
