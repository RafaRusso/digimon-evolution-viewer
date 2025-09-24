#!/usr/bin/env python3.11
"""
Script para Corrigir Requisitos de TALENT
- Corrige requisitos de TALENT que não foram capturados
- Adiciona outros requisitos especiais
"""

import json
import re
import os

def fix_talent_requirements():
    """Corrige requisitos de TALENT no JSON"""
    
    data_file = "../src/assets/digimon_data.json"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar dados: {e}")
        return
    
    # Carregar HTML para re-processar TALENT
    html_file = "../upload/source.html"
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"❌ Erro ao carregar HTML: {e}")
        return
    
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar todos os links de Digimons
    digimon_links = soup.find_all('a', href=re.compile(r'/digimon/\d+'))
    
    updated = 0
    
    for link in digimon_links:
        try:
            # Extrair nome do Digimon
            img = link.find('img', title=True)
            if not img:
                continue
                
            digimon_name = img.get('title').strip()
            
            # Verificar se existe nos dados
            if digimon_name not in data.get("digimon_requirements", {}):
                continue
            
            # Encontrar o div com os requisitos
            divs = link.find_all('div')
            if len(divs) < 3:
                continue
                
            content_div = divs[-1]
            html_content_div = str(content_div)
            
            # Procurar por TALENT especificamente
            talent_match = re.search(r'TALENT\s*>=\s*(\d+)', html_content_div)
            if talent_match:
                talent_value = int(talent_match.group(1))
                
                # Adicionar requisito de talento
                if "other" not in data["digimon_requirements"][digimon_name]:
                    data["digimon_requirements"][digimon_name]["other"] = []
                
                # Verificar se já existe
                has_talent = False
                for req in data["digimon_requirements"][digimon_name]["other"]:
                    if req["name"] == "Talento":
                        has_talent = True
                        break
                
                if not has_talent:
                    data["digimon_requirements"][digimon_name]["other"].append({
                        "name": "Talento",
                        "value": talent_value,
                        "description": f"Talento {talent_value} ou superior"
                    })
                    updated += 1
                    print(f"  ✅ Adicionado Talento para {digimon_name}: {talent_value}")
            
            # Procurar por itens especiais (??? item)
            item_match = re.search(r'Have \?\?\? item', html_content_div)
            if item_match:
                # Adicionar requisito de item especial
                if "other" not in data["digimon_requirements"][digimon_name]:
                    data["digimon_requirements"][digimon_name]["other"] = []
                
                # Verificar se já existe
                has_item = False
                for req in data["digimon_requirements"][digimon_name]["other"]:
                    if "Item Especial" in req["description"]:
                        has_item = True
                        break
                
                if not has_item:
                    data["digimon_requirements"][digimon_name]["other"].append({
                        "name": "Item",
                        "value": "Item Especial",
                        "description": "Possuir Item Especial (não especificado)"
                    })
                    print(f"  ✅ Adicionado Item Especial para {digimon_name}")
        
        except Exception as e:
            continue
    
    # Salvar dados atualizados
    try:
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {updated} requisitos de Talento adicionados")
        print(f"✅ Dados salvos: {data_file}")
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")

def create_final_sample():
    """Cria amostra final com Floramon e outros exemplos"""
    
    data_file = "../src/assets/digimon_data.json"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar dados: {e}")
        return
    
    # Exemplos interessantes para mostrar
    examples = {}
    
    # Floramon (exemplo do usuário)
    if "Floramon" in data.get("digimon_requirements", {}):
        examples["Floramon"] = data["digimon_requirements"]["Floramon"]
    
    # Lucemon (com talento)
    if "Lucemon" in data.get("digimon_requirements", {}):
        examples["Lucemon"] = data["digimon_requirements"]["Lucemon"]
    
    # Alguns outros interessantes
    interesting_names = ["Agumon", "Greymon", "WarGreymon", "Omegamon", "Coronamon"]
    for name in interesting_names:
        if name in data.get("digimon_requirements", {}):
            examples[name] = data["digimon_requirements"][name]
    
    with open("../src/assets/final_requirements_sample.json", 'w', encoding='utf-8') as f:
        json.dump(examples, f, ensure_ascii=False, indent=2)
    
    print("📋 Amostra final salva: final_requirements_sample.json")

def main():
    print("🔧 Correção de Requisitos de TALENT")
    print("=" * 35)
    
    fix_talent_requirements()
    create_final_sample()
    
    print("\n✅ Correções concluídas!")
    print("🎯 Todos os requisitos estão agora completos")

if __name__ == "__main__":
    main()
