#!/usr/bin/env python3.11
import pandas as pd
import json
import os
from collections import defaultdict

def process_digimon_data(excel_path):
    """
    Processa os dados da planilha Excel e cria uma estrutura de dados
    para visualizar as linhas evolutivas dos Digimons.
    """
    # Carregar dados
    df = pd.read_excel(excel_path)
    
    # Criar estruturas de dados
    digimons = {}  # Informações básicas de cada Digimon
    evolutions = defaultdict(list)  # Quem evolui para quem
    pre_evolutions = defaultdict(list)  # Quem evolui de quem
    
    # Processar cada linha
    for _, row in df.iterrows():
        digimon_name = row['Name']
        if pd.isna(digimon_name):
            continue
            
        # Armazenar informações básicas
        digimons[digimon_name] = {
            'number': row['Number'],
            'name': digimon_name,
            'stage': row['Stage'],
            'attribute': row['Attribute'] if not pd.isna(row['Attribute']) else 'N/A'
        }
        
        # Processar evoluções (colunas Evolutions e Unnamed)
        evolution_columns = ['Evolutions', 'Unnamed: 6', 'Unnamed: 7', 'Unnamed: 8', 'Unnamed: 9', 'Unnamed: 10']
        
        for col in evolution_columns:
            if col in row and not pd.isna(row[col]):
                evolution_name = row[col].strip()
                if evolution_name:
                    evolutions[digimon_name].append(evolution_name)
                    pre_evolutions[evolution_name].append(digimon_name)
    
    return digimons, evolutions, pre_evolutions

def search_digimons(query, digimons):
    """
    Busca Digimons por nome (busca parcial, case-insensitive).
    """
    query = query.lower()
    results = []
    
    for name, info in digimons.items():
        if query in name.lower():
            results.append(info)
    
    return sorted(results, key=lambda x: x['name'])

if __name__ == "__main__":
    # Caminhos relativos dentro do projeto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Procurar arquivo Excel na pasta data/
    data_dir = os.path.join(script_dir, 'data')
    excel_files = []
    
    if os.path.exists(data_dir):
        for file in os.listdir(data_dir):
            if file.endswith(('.xlsx', '.xls')):
                excel_files.append(os.path.join(data_dir, file))
    
    if not excel_files:
        print("❌ Nenhum arquivo Excel encontrado!")
        print(f"📁 Coloque seu arquivo Excel na pasta: {data_dir}")
        print("📝 Crie a pasta 'data' se ela não existir")
        exit()
    
    excel_path = excel_files[0]  # Usar o primeiro arquivo encontrado
    print(f"📂 Processando: {os.path.basename(excel_path)}")
    
    # Processar dados
    digimons, evolutions, pre_evolutions = process_digimon_data(excel_path)
    
    print(f"✅ Processados {len(digimons)} Digimons")
    print(f"✅ Total de relações evolutivas: {sum(len(evos) for evos in evolutions.values())}")
    
    # Salvar dados processados
    data = {
        'digimons': digimons,
        'evolutions': dict(evolutions),
        'pre_evolutions': dict(pre_evolutions)
    }
    
    # Salvar na pasta src/assets
    output_path = os.path.join(script_dir, 'src', 'assets', 'digimon_data.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Dados salvos em: src/assets/digimon_data.json")
    
    # Teste com Coronamon
    test_name = "Coronamon"
    if test_name in digimons:
        print(f"\n🧪 TESTE: {test_name}")
        print(f"   Número: {digimons[test_name]['number']}")
        print(f"   Stage: {digimons[test_name]['stage']}")
        print(f"   Atributo: {digimons[test_name]['attribute']}")
        
        if test_name in evolutions:
            print(f"   Evolui para: {', '.join(evolutions[test_name][:3])}...")
        
        if test_name in pre_evolutions:
            print(f"   Evolui de: {', '.join(pre_evolutions[test_name])}")
    
    print(f"\n🎯 Processo concluído!")
    print(f"📁 Estrutura esperada:")
    print(f"   digimon-evolution-viewer/")
    print(f"   ├── data/                    ← Coloque Excel aqui")
    print(f"   ├── src/assets/")
    print(f"   │   └── digimon_data.json   ← Dados processados")
    print(f"   └── process_digimon_data.py ← Este script")
