// src/components/TeamBuilderPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Users, Shield, Sword, BarChart3, TreePine, Move } from 'lucide-react';
import { useTeams, useTeam, useTeamDigimons, useTeamAnalysis } from '../hooks/useTeams';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import TeamSlot from './TeamSlot';
import DigimonSelector from './DigimonSelector';
import TeamAnalysis from './TeamAnalysis';
import TeamList from './TeamList';
import EvolutionPathViewer from './EvolutionPathViewer';
import TeamExporter from './TeamExporter';

export default function TeamBuilderPage({ onDigimonSelect, onImagePreview }) {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDigimonForEvolution, setSelectedDigimonForEvolution] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  // --- NOVO ESTADO PARA O MODO DE MOVIMENTAÇÃO ---
  const [movingDigimon, setMovingDigimon] = useState(null); // Estrutura: { digimon, fromSlotType, fromPosition }

  const { teams, addTeam, isAddingTeam } = useTeams();
  const { data: currentTeam, refetch: refetchTeam } = useTeam(selectedTeamId);
  const { addDigimon, removeDigimon, moveDigimon } = useTeamDigimons(selectedTeamId, {
    onSuccess: () => {
      refetchTeam(); // Garante que a UI atualize após a mutação
    }
  });
  const { data: teamAnalysis } = useTeamAnalysis(selectedTeamId);

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const teamDigimons = useMemo(() => {
    if (!currentTeam) return [];
    return [...currentTeam.starters, ...currentTeam.reserves].filter(Boolean);
  }, [currentTeam]);

  useEffect(() => {
    if (teamDigimons.length > 0 && !selectedDigimonForEvolution) {
      setSelectedDigimonForEvolution(teamDigimons[0]);
    } else if (teamDigimons.length === 0) {
      setSelectedDigimonForEvolution(null);
    }
  }, [teamDigimons, selectedDigimonForEvolution]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam({ name: newTeamName, description: newTeamDescription }, {
      onSuccess: (result) => {
        setSelectedTeamId(result.team.id);
        setNewTeamName('');
        setNewTeamDescription('');
        setIsCreateDialogOpen(false);
      }
    });
  };

  const handleDigimonSelect = (digimon) => {
    if (selectedSlot && selectedTeamId) {
      addDigimon({ digimon, slotType: selectedSlot.slotType, position: selectedSlot.position });
    }
    setIsSelectorOpen(false);
    setSelectedSlot(null);
  };

  const handleSlotRemove = (slotType, position) => {
    if (selectedTeamId) removeDigimon({ slotType, position });
  };

  const handleDigimonClick = (digimon) => {
    setSelectedDigimonForEvolution(digimon);
    if (onDigimonSelect) onDigimonSelect(digimon);
  };

  const handleImageClick = (digimon) => {
    if (onImagePreview) onImagePreview(digimon);
  };

  // --- NOVAS FUNÇÕES PARA MOVIMENTAÇÃO ---

  const handleMoveInitiate = (digimon, slotType, position) => {
    if (movingDigimon && movingDigimon.fromPosition === position && movingDigimon.fromSlotType === slotType) {
      setMovingDigimon(null); // Clicar de novo no mesmo cancela
    } else {
      setMovingDigimon({ digimon, fromSlotType: slotType, fromPosition: position });
    }
  };

  const handleSlotClick = (slotType, position) => {
    if (movingDigimon) {
      // Se estamos em modo de movimento, executa a troca
      if (movingDigimon.fromSlotType === slotType && movingDigimon.fromPosition === position) {
        // Clicar no mesmo slot cancela a seleção
        setMovingDigimon(null);
        return;
      }
      moveDigimon({ 
        fromSlotType: movingDigimon.fromSlotType, 
        fromPosition: movingDigimon.fromPosition, 
        toSlotType: slotType, 
        toPosition: position 
      });
      setMovingDigimon(null); // Finaliza o modo de movimento
    } else {
      // Se não, abre o seletor de Digimon para adicionar
      setSelectedSlot({ slotType, position });
      setIsSelectorOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
          <p className="text-gray-300 mt-1">Monte seu time perfeito com 6 Digimons (3 titulares + 3 reservas)</p>
        </div>
        <div className="flex items-center gap-2">
          <TeamExporter team={currentTeam} teams={teams} />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Novo Time</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Criar Novo Time</DialogTitle><DialogDescription>Dê um nome ao seu novo time de Digimons</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div><Label htmlFor="team-name">Nome do Time</Label><Input id="team-name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Ex: Time dos Campeões" maxLength={50} /></div>
                <div><Label htmlFor="team-description">Descrição (opcional)</Label><Textarea id="team-description" value={newTeamDescription} onChange={(e) => setNewTeamDescription(e.target.value)} placeholder="Descreva a estratégia do seu time..." maxLength={200} rows={3} /></div>
                <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button><Button onClick={handleCreateTeam} disabled={!newTeamName.trim() || isAddingTeam}>{isAddingTeam ? 'Criando...' : 'Criar Time'}</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="flex items-center gap-2"><Users className="w-4 h-4" />Construtor</TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Análise</TabsTrigger>
          <TabsTrigger value="evolutions" className="flex items-center gap-2"><TreePine className="w-4 h-4" />Evoluções</TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2"><Shield className="w-4 h-4" />Meus Times</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6 mt-6">
          {currentTeam ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />{currentTeam.name}</CardTitle>
                      {currentTeam.description && <CardDescription className="mt-1">{currentTeam.description}</CardDescription>}
                    </div>
                    {teamAnalysis && <Badge variant="outline">{teamAnalysis.total}/6 Digimons</Badge>}
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Sword className="w-5 h-5 text-red-500" />Titulares</CardTitle><CardDescription>Os 3 Digimons que entram em combate primeiro</CardDescription></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((position) => (
                        <TeamSlot 
                          key={`starter-${position}`} 
                          digimon={currentTeam.starters[position]} 
                          slotType="starters" 
                          position={position} 
                          onSlotClick={() => handleSlotClick('starters', position)} 
                          onSlotRemove={() => handleSlotRemove('starters', position)} 
                          onDigimonClick={handleDigimonClick} 
                          onImageClick={handleImageClick}
                          onMoveInitiate={handleMoveInitiate}
                          isMoving={movingDigimon?.fromSlotType === 'starters' && movingDigimon?.fromPosition === position}
                          isMoveTarget={!!movingDigimon}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" />Reservas</CardTitle><CardDescription>Os 3 Digimons que entram quando necessário</CardDescription></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((position) => (
                        <TeamSlot 
                          key={`reserve-${position}`} 
                          digimon={currentTeam.reserves[position]} 
                          slotType="reserves" 
                          position={position} 
                          onSlotClick={() => handleSlotClick('reserves', position)} 
                          onSlotRemove={() => handleSlotRemove('reserves', position)} 
                          onDigimonClick={handleDigimonClick} 
                          onImageClick={handleImageClick}
                          onMoveInitiate={handleMoveInitiate}
                          isMoving={movingDigimon?.fromSlotType === 'reserves' && movingDigimon?.fromPosition === position}
                          isMoveTarget={!!movingDigimon}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><Users className="w-12 h-12 text-gray-400 mb-4" /><h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhum time selecionado</h3><p className="text-gray-400 text-center mb-4">Crie um novo time ou selecione um existente para começar</p><Button onClick={() => setIsCreateDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Criar Primeiro Time</Button></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="analysis"><TeamAnalysis team={currentTeam} analysis={teamAnalysis} onDigimonClick={handleDigimonClick} onImageClick={handleImageClick} /></TabsContent>
        <TabsContent value="evolutions">{selectedDigimonForEvolution ? <EvolutionPathViewer digimon={selectedDigimonForEvolution} onDigimonSelect={handleDigimonClick} onImageClick={handleImageClick} selectedDigimons={teamDigimons} showAsProgress={true} /> : <Card><CardContent className="flex flex-col items-center justify-center py-12"><TreePine className="w-12 h-12 text-gray-400 mb-4" /><h3 className="text-lg font-semibold text-gray-300 mb-2">Selecione um Digimon</h3><p className="text-gray-400 text-center">Clique em um Digimon do seu time para ver seus caminhos evolutivos</p></CardContent></Card>}</TabsContent>
        <TabsContent value="teams"><TeamList teams={teams} selectedTeamId={selectedTeamId} onTeamSelect={setSelectedTeamId} onCreateTeam={() => setIsCreateDialogOpen(true)} /></TabsContent>
      </Tabs>

      <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b border-gray-700"><DialogTitle>Selecionar Digimon</DialogTitle><DialogDescription>Escolha um Digimon para adicionar ao seu time</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-hidden"><DigimonSelector onDigimonSelect={handleDigimonSelect} onCancel={() => setIsSelectorOpen(false)} /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
