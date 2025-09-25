#!/usr/bin/env python3
"""
Script para migrar dados do JSON para o banco Supabase
Execute após configurar o schema SQL no Supabase
"""

import json
import os
import sys
from supabase import create_client, Client
from typing import Dict, List, Any

# Configurações do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://your-project.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')

def load_json_data(file_path: str) -> Dict[str, Any]:
    """Carrega os dados do arquivo JSON"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Erro: Arquivo {file_path} não encontrado")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
        sys.exit(1)

def init_supabase() -> Client:
    """Inicializa cliente Supabase"""
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Erro ao conectar com Supabase: {e}")
        sys.exit(1)

def migrate_digimons(supabase: Client, digimons_data: Dict[str, Any]) -> Dict[str, str]:
    """Migra dados dos Digimons e retorna mapeamento nome -> id"""
    print("Migrando Digimons...")
    
    digimons_to_insert = []
    name_to_id_map = {}
    
    for name, digimon in digimons_data.items():
        digimon_record = {
            'number': digimon['number'],
            'name': digimon['name'],
            'stage': digimon['stage'],
            'attribute': digimon['attribute'],
            'image_filename': digimon.get('image')
        }
        digimons_to_insert.append(digimon_record)
    
    try:
        # Inserir em lotes de 100
        batch_size = 100
        for i in range(0, len(digimons_to_insert), batch_size):
            batch = digimons_to_insert[i:i + batch_size]
            result = supabase.table('digimons').insert(batch).execute()
            
            # Mapear nomes para IDs
            for record in result.data:
                name_to_id_map[record['name']] = record['id']
            
            print(f"Inseridos {len(batch)} Digimons (lote {i//batch_size + 1})")
        
        print(f"Total de {len(digimons_to_insert)} Digimons migrados com sucesso!")
        return name_to_id_map
        
    except Exception as e:
        print(f"Erro ao migrar Digimons: {e}")
        sys.exit(1)

def migrate_evolutions(supabase: Client, evolutions_data: Dict[str, List[str]], name_to_id_map: Dict[str, str]):
    """Migra dados das evoluções"""
    print("Migrando evoluções...")
    
    evolutions_to_insert = []
    
    for from_name, to_names in evolutions_data.items():
        if from_name not in name_to_id_map:
            print(f"Aviso: Digimon '{from_name}' não encontrado no mapeamento")
            continue
            
        from_id = name_to_id_map[from_name]
        
        for to_name in to_names:
            if to_name not in name_to_id_map:
                print(f"Aviso: Digimon '{to_name}' não encontrado no mapeamento")
                continue
                
            to_id = name_to_id_map[to_name]
            
            evolution_record = {
                'from_digimon_id': from_id,
                'to_digimon_id': to_id
            }
            evolutions_to_insert.append(evolution_record)
    
    try:
        # Inserir em lotes de 100
        batch_size = 100
        for i in range(0, len(evolutions_to_insert), batch_size):
            batch = evolutions_to_insert[i:i + batch_size]
            supabase.table('evolutions').insert(batch).execute()
            print(f"Inseridas {len(batch)} evoluções (lote {i//batch_size + 1})")
        
        print(f"Total de {len(evolutions_to_insert)} evoluções migradas com sucesso!")
        
    except Exception as e:
        print(f"Erro ao migrar evoluções: {e}")
        sys.exit(1)

def migrate_requirements(supabase: Client, requirements_data: Dict[str, Any], name_to_id_map: Dict[str, str]):
    """Migra dados dos requisitos de evolução"""
    print("Migrando requisitos de evolução...")
    
    requirements_to_insert = []
    
    for digimon_name, requirements in requirements_data.items():
        if digimon_name not in name_to_id_map:
            print(f"Aviso: Digimon '{digimon_name}' não encontrado no mapeamento")
            continue
            
        digimon_id = name_to_id_map[digimon_name]
        
        # Processar requisitos de stats
        if 'stats' in requirements:
            for stat in requirements['stats']:
                requirement_record = {
                    'digimon_id': digimon_id,
                    'requirement_type': 'stats',
                    'name': stat['name'],
                    'value': stat.get('value', ''),
                    'description': stat['description']
                }
                requirements_to_insert.append(requirement_record)
        
        # Processar outros requisitos
        if 'other' in requirements:
            for other in requirements['other']:
                requirement_record = {
                    'digimon_id': digimon_id,
                    'requirement_type': 'other',
                    'name': other['name'],
                    'value': other.get('value', ''),
                    'description': other['description']
                }
                requirements_to_insert.append(requirement_record)
    
    try:
        # Inserir em lotes de 100
        batch_size = 100
        for i in range(0, len(requirements_to_insert), batch_size):
            batch = requirements_to_insert[i:i + batch_size]
            supabase.table('evolution_requirements').insert(batch).execute()
            print(f"Inseridos {len(batch)} requisitos (lote {i//batch_size + 1})")
        
        print(f"Total de {len(requirements_to_insert)} requisitos migrados com sucesso!")
        
    except Exception as e:
        print(f"Erro ao migrar requisitos: {e}")
        sys.exit(1)

def main():
    """Função principal"""
    print("=== Migração de Dados para Supabase ===")
    
    # Verificar variáveis de ambiente
    if SUPABASE_URL == 'https://your-project.supabase.co' or SUPABASE_KEY == 'your-anon-key':
        print("Erro: Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY")
        print("Exemplo:")
        print("export SUPABASE_URL='https://your-project.supabase.co'")
        print("export SUPABASE_ANON_KEY='your-anon-key'")
        sys.exit(1)
    
    # Carregar dados JSON
    json_file = 'digimon_data.json'
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    
    print(f"Carregando dados de {json_file}...")
    data = load_json_data(json_file)
    
    # Inicializar Supabase
    print("Conectando ao Supabase...")
    supabase = init_supabase()
    
    # Migrar dados
    try:
        # 1. Migrar Digimons
        name_to_id_map = migrate_digimons(supabase, data['digimons'])
        
        # 2. Migrar evoluções
        if 'evolutions' in data:
            migrate_evolutions(supabase, data['evolutions'], name_to_id_map)
        
        # 3. Migrar requisitos
        if 'digimon_requirements' in data:
            migrate_requirements(supabase, data['digimon_requirements'], name_to_id_map)
        
        print("\n=== Migração concluída com sucesso! ===")
        print(f"- {len(data['digimons'])} Digimons")
        print(f"- {sum(len(evos) for evos in data.get('evolutions', {}).values())} evoluções")
        print(f"- {len(data.get('digimon_requirements', {}))} Digimons com requisitos")
        
    except KeyboardInterrupt:
        print("\nMigração interrompida pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"Erro durante a migração: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
