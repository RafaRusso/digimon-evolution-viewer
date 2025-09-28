import React, { useState, useMemo } from 'react';
import { Heart, Search, Filter, SortAsc, SortDesc, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import DigimonCard from './DigimonCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useFavorites, useFavoritesImportExport } from '../hooks/useFavorites';

export function FavoritesPage({ onDigimonSelect, onImagePreview }) {
  // --- ESTADOS PARA CONTROLES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all'); // 'all' para todos
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'stage'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // --- HOOKS DE DADOS ---
  const { favorites, isLoading, isError, error, clearAllFavorites, isClearingFavorites } = useFavorites();
  const { exportFavorites, importFavorites, isExporting, isImporting } = useFavoritesImportExport();

  // --- LÓGICA DE FILTRO E ORDENAÇÃO (USANDO useMemo PARA PERFORMANCE) ---
  const filteredAndSortedFavorites = useMemo(() => {
    if (!favorites) return [];

    // 1. Filtro por busca de texto (case-insensitive)
    const searched = favorites.filter(fav =>
      fav.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Filtro por stage
    const filteredByStage = selectedStage === 'all'
      ? searched
      : searched.filter(fav => fav.stage === selectedStage);

    // 3. Ordenação
    const sorted = [...filteredByStage].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stage':
          { const stageOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VI+'];
          const indexA = stageOrder.indexOf(a.stage);
          const indexB = stageOrder.indexOf(b.stage);
          if (indexA !== -1 && indexB !== -1) {
            comparison = indexA - indexB;
          } else {
            comparison = a.stage.localeCompare(b.stage);
          }
          break; }
        case 'date':
        default:
          // Garante que 'addedAt' exista para evitar erros
          comparison = new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
          break;
      }
      // Inverte a comparação para ordenação ascendente
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }, [favorites, searchQuery, selectedStage, sortBy, sortOrder]);

  // Extrai os stages únicos diretamente dos favoritos para o dropdown de filtro
  const uniqueStages = useMemo(() => {
    if (!favorites) return [];
    const stages = new Set(favorites.map(fav => fav.stage));
    return Array.from(stages).sort(); // Ordena para consistência
  }, [favorites]);

  // Handler para importar arquivo
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => importFavorites(e.target.result);
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  // --- RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO E ERRO ---
  if (isLoading) {
    return (
      <div className="flex justify-center py-16"><LoadingSpinner size="xl" /><p className="mt-4">Carregando...</p></div>
    );
  }

  if (isError) {
    return <ErrorMessage message={error?.message || 'Erro ao carregar favoritos'} />;
  }

  // --- RENDERIZAÇÃO PARA QUANDO NÃO HÁ FAVORITOS ---
  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold">Nenhum favorito ainda</h2>
        <p className="text-gray-500 mt-2">Adicione Digimons aos seus favoritos e eles aparecerão aqui.</p>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL DO COMPONENTE ---
  return (
    <div className="space-y-6">
      <Card className="digimon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            Meus Favoritos
            <Badge variant="secondary" className="ml-auto">{favorites.length} Digimons</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de filtro e busca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative sm:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar favoritos pelo nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrar por Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Stages</SelectItem>
                {uniqueStages.map(stage => (
                  <SelectItem key={stage} value={stage}>Stage {stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [by, order] = v.split('-'); setSortBy(by); setSortOrder(order); }}>
              <SelectTrigger>
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Mais recentes</SelectItem>
                <SelectItem value="date-asc">Mais antigos</SelectItem>
                <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                <SelectItem value="stage-asc">Stage (crescente)</SelectItem>
                <SelectItem value="stage-desc">Stage (decrescente)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações de gerenciamento */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={exportFavorites} disabled={isExporting}><Download className="w-4 h-4 mr-2" />{isExporting ? 'Exportando...' : 'Exportar'}</Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file').click()} disabled={isImporting}><Upload className="w-4 h-4 mr-2" />{isImporting ? 'Importando...' : 'Importar'}</Button>
            <input id="import-file" type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isClearingFavorites}><Trash2 className="w-4 h-4 mr-2" />Limpar Todos</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Confirmar limpeza</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover todos os {favorites.length} favoritos? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllFavorites} className="bg-red-600 hover:bg-red-700">Sim, limpar todos</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Lista de favoritos */}
          {filteredAndSortedFavorites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum favorito encontrado com os filtros aplicados.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedFavorites.map(favorite => (
                <DigimonCard key={favorite.id} digimon={favorite} onClick={onDigimonSelect} onImageClick={onImagePreview} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FavoritesPage;
