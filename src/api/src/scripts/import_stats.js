import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Script para importar dados de status dos Digimons do arquivo CSV do Kaggle
 * Atualizado para a estrutura atual do banco (BIGINT IDs)
 * 
 * Este script:
 * 1. Lê o arquivo DigiDB_digimonlist.csv
 * 2. Mapeia os nomes dos Digimons para IDs existentes no banco
 * 3. Converte os stats de nível 50 para stats base (aproximação)
 * 4. Insere os dados na tabela digimon_stats
 */

// Função para converter stats de nível 50 para base (aproximação)
function convertToBaseStats(level50Stats) {
  // Fórmula aproximada baseada em jogos similares
  // Stats base são aproximadamente 60% dos stats de nível 50
  const baseMultiplier = 0.6;
  return {
    hp: Math.round(level50Stats.hp * baseMultiplier),
    sp: Math.round(level50Stats.sp * baseMultiplier),
    atk: Math.round(level50Stats.atk * baseMultiplier),
    def: Math.round(level50Stats.def * baseMultiplier),
    int: Math.round(level50Stats.int * baseMultiplier),
    spd: Math.round(level50Stats.spd * baseMultiplier)
  };
}

// Função para normalizar nomes de Digimons
function normalizeDigimonName(name) {
  return name
    .trim()
    .replace(/\s*\([^)]*\)/g, '') // Remove texto entre parênteses como "(Blk)"
    .replace(/\s+/g, ' ') // Normaliza espaços
    .toLowerCase();
}

// Função para mapear estágios do CSV para os estágios do projeto
function mapStage(csvStage) {
  const stageMap = {
    'Baby': 'I',
    'In-Training': 'II',
    'Rookie': 'III',
    'Champion': 'IV',
    'Ultimate': 'V',
    'Mega': 'VI'
  };
  
  return stageMap[csvStage] || csvStage;
}

// Função para mapear tipos do CSV para atributos do projeto
function mapAttribute(csvType) {
  const typeMap = {
    'Vaccine': 'Vaccine',
    'Virus': 'Virus',
    'Data': 'Data',
    'Free': 'N/A'
  };
  
  return typeMap[csvType] || 'N/A';
}

async function importDigimonStats() {
  try {
    console.log('🚀 Iniciando importação de stats dos Digimons...');
    
    // 1. Ler o arquivo CSV
    const csvPath = path.join(__dirname, 'DigiDB_digimonlist.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    // Quebra por quebra de linha (Windows ou Unix) e remove linhas vazias
    const lines = csvContent.split(/\r?\n/).filter(line => line.length > 0);
    
    // 3. Buscar todos os Digimons existentes no banco
    console.log('🔍 Buscando Digimons existentes no banco...');
    const { data: existingDigimons, error: fetchError } = await supabase
      .from('digimons')
      .select('id, name, stage, attribute');
    
    if (fetchError) {
      throw new Error(`Erro ao buscar Digimons: ${fetchError.message}`);
    }
    
    console.log(`✅ Encontrados ${existingDigimons.length} Digimons no banco`);
    
    // 4. Criar mapa de nomes para IDs
    const nameToIdMap = new Map();
    existingDigimons.forEach(digimon => {
      const normalizedName = normalizeDigimonName(digimon.name);
      nameToIdMap.set(normalizedName, digimon);
    });
    
    // 5. Processar dados do CSV
    const statsToInsert = [];
    const unmatchedDigimons = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      console.log(`DEBUG: Linha ${i}, Colunas: ${columns.length}, Nome Bruto: "${columns[1]}"`);
      if (columns.length < 12) continue;
      
      const csvDigimon = {
        number: parseInt(columns[0]),
        name: columns[1],
        stage: columns[2],
        type: columns[3],
        attribute: columns[4],
        memory: parseInt(columns[5]),
        equipSlots: parseInt(columns[6]),
        hp: parseInt(columns[7]),
        sp: parseInt(columns[8]),
        atk: parseInt(columns[9]),
        def: parseInt(columns[10]),
        int: parseInt(columns[11]),
        spd: parseInt(columns[12])
      };
      
      // Normalizar nome para busca
      const normalizedName = normalizeDigimonName(csvDigimon.name);
      const existingDigimon = nameToIdMap.get(normalizedName);
      
      if (existingDigimon) {
        // Converter stats de nível 50 para base
        const baseStats = convertToBaseStats({
          hp: csvDigimon.hp,
          sp: csvDigimon.sp,
          atk: csvDigimon.atk,
          def: csvDigimon.def,
          int: csvDigimon.int,
          spd: csvDigimon.spd
        });
        
        statsToInsert.push({
          digimon_id: existingDigimon.id, // Agora é BIGINT
          hp: baseStats.hp,
          sp: baseStats.sp,
          atk: baseStats.atk,
          def: baseStats.def,
          int: baseStats.int,
          spd: baseStats.spd,
          level: 1,
          source: 'cyber_sleuth_converted'
        });
      } else {
        unmatchedDigimons.push({
          csvName: csvDigimon.name,
          normalizedName: normalizedName,
          stage: csvDigimon.stage,
          type: csvDigimon.type
        });
      }
    }
    
    console.log(`📊 Processamento concluído:`);
    console.log(`   - Stats para inserir: ${statsToInsert.length}`);
    console.log(`   - Digimons não encontrados: ${unmatchedDigimons.length}`);
    
    if (unmatchedDigimons.length > 0) {
      console.log('\n⚠️  Digimons não encontrados no banco:');
      unmatchedDigimons.slice(0, 10).forEach(d => {
        console.log(`   - ${d.csvName} (${d.normalizedName})`);
      });
      if (unmatchedDigimons.length > 10) {
        console.log(`   ... e mais ${unmatchedDigimons.length - 10} outros`);
      }
    }
    
    // 6. Inserir dados no banco (em lotes para melhor performance)
    if (statsToInsert.length > 0) {
      console.log('\n💾 Inserindo stats no banco de dados...');
      
      const batchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < statsToInsert.length; i += batchSize) {
        const batch = statsToInsert.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('digimon_stats')
          .insert(batch);
        
        if (insertError) {
          console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, insertError.message);
          // Continua com o próximo lote
        } else {
          insertedCount += batch.length;
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido (${batch.length} registros)`);
        }
      }
      
      console.log(`\n🎉 Importação concluída! ${insertedCount} stats inseridos com sucesso.`);
    } else {
      console.log('\n⚠️  Nenhum stat foi inserido.');
    }
    
    // 7. Verificar resultado final
    const { count, error: countError } = await supabase
      .from('digimon_stats')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📈 Total de stats na tabela: ${count}`);
    }
    
    // 8. Mostrar alguns exemplos de dados inseridos
    console.log('\n📋 Exemplos de dados inseridos:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('digimon_stats')
      .select(`
        *,
        digimons!inner(name, stage, attribute)
      `)
      .limit(5);
    
    if (!sampleError && sampleData) {
      sampleData.forEach(stat => {
        console.log(`   - ${stat.digimons.name}: HP=${stat.hp}, ATK=${stat.atk}, DEF=${stat.def}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Erro durante a importação:', error.message);
    process.exit(1);
  }
}

// Executar o script
importDigimonStats()
  .then(() => {
    console.log('✨ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });