#!/usr/bin/env python3.11
"""
Script para Extrair Requisitos do HTML SkullBot - Versão 2
- Extrai todos os requisitos de evolução do HTML
- Converte para o formato JSON especificado
- Integra com dados existentes
"""

import json
import re
from bs4 import BeautifulSoup
import os

def parse_requirements_from_html(html_content):
    """Extrai requisitos de todos os Digimons do HTML"""
    
    # Dicionário de tradução de stats
    stat_translation = {
        'HP': 'PV Máx',
        'MP': 'PM Máx', 
        'ATK': 'ATK',
        'DEF': 'DEF',
        'INT': 'INT',
        'SPI': 'SPI',
        'SPD': 'VEL',
        'Talent': 'Talento'
    }
    
    # Dicionário de tradução de personalidades
    personality_translation = {
        'Brave': 'Corajoso',
        'Calm': 'Calmo',
        'Cool': 'Frio',
        'Devoted': 'Devotado',
        'Hardy': 'Resistente',
        'Kind': 'Gentil',
        'Lively': 'Animado',
        'Loyal': 'Leal',
        'Mild': 'Suave',
        'Rough': 'Rude'
    }
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar todos os links de Digimons que têm href com /digimon/
    digimon_links = soup.find_all('a', href=re.compile(r'/digimon/\d+'))
    
    digimon_requirements = {}
    processed = 0
    
    print(f"🔍 Encontrados {len(digimon_links)} links de Digimons")
    
    for link in digimon_links:
        try:
            # Extrair nome do Digimon do title da imagem
            img = link.find('img', title=True)
            if not img:
                continue
                
            digimon_name = img.get('title').strip()
            
            # Encontrar o div com os requisitos (último div do link)
            divs = link.find_all('div')
            if len(divs) < 3:  # Precisa ter pelo menos id, digi, e content
                continue
                
            # O último div contém as informações do Digimon
            content_div = divs[-1]
            
            # Pegar todo o HTML interno para preservar <br> tags
            html_content_div = str(content_div)
            
            # Dividir por <br> e processar
            parts = re.split(r'<br\s*/?>', html_content_div)
            
            # Encontrar linhas que começam com &bull; (bullet points)
            requirement_lines = []
            for part in parts:
                # Limpar HTML tags e entidades
                clean_part = BeautifulSoup(part, 'html.parser').get_text().strip()
                if clean_part.startswith('•') or '&bull;' in part:
                    # Limpar entidades HTML
                    clean_part = clean_part.replace('•', '').strip()
                    if clean_part:
                        requirement_lines.append(clean_part)
            
            if not requirement_lines:
                continue
            
            # Processar requisitos
            requirements = {
                "stats": [],
                "other": []
            }
            
            for req_line in requirement_lines:
                req_text = req_line.strip()
                
                # Agent Rank
                agent_match = re.match(r'Agent Rank\s*>=\s*(\d+)', req_text)
                if agent_match:
                    rank_value = int(agent_match.group(1))
                    requirements["other"].append({
                        "name": "Patente",
                        "value": f"Agente {rank_value}",
                        "description": f"Patente de Agente {rank_value} ou superior"
                    })
                    continue
                
                # Stats numéricos (HP, MP, ATK, DEF, INT, SPI, SPD)
                stat_match = re.match(r'(HP|MP|ATK|DEF|INT|SPI|SPD)\s*>=\s*(\d+)', req_text)
                if stat_match:
                    stat_name = stat_match.group(1)
                    stat_value = int(stat_match.group(2))
                    
                    translated_name = stat_translation.get(stat_name, stat_name)
                    
                    requirements["stats"].append({
                        "name": translated_name,
                        "value": stat_value,
                        "operator": ">=",
                        "description": f"{stat_value} ou mais de {translated_name}"
                    })
                    continue
                
                # Talent
                talent_match = re.match(r'Talent\s*>=\s*(\d+)', req_text)
                if talent_match:
                    talent_value = int(talent_match.group(1))
                    requirements["other"].append({
                        "name": "Talento",
                        "value": talent_value,
                        "description": f"Talento {talent_value} ou superior"
                    })
                    continue
                
                # Skills learned
                skills_match = re.search(r'(\w+)\s+Agent Skills learned\s*=\s*(\d+)', req_text)
                if skills_match:
                    skill_type = skills_match.group(1)
                    skill_count = int(skills_match.group(2))
                    requirements["other"].append({
                        "name": "Habilidades",
                        "value": f"{skill_type} {skill_count}",
                        "description": f"{skill_count} habilidades {skill_type} aprendidas"
                    })
                    continue
                
                # Digi-Eggs
                egg_match = re.search(r'Have Digi-Egg of (\w+)', req_text)
                if egg_match:
                    egg_type = egg_match.group(1)
                    requirements["other"].append({
                        "name": "Digi-Ovo",
                        "value": egg_type,
                        "description": f"Possuir Digi-Ovo da {egg_type}"
                    })
                    continue

                # Item
                item_match = re.search(r'Have (.+?) item', req_text, re.IGNORECASE)
                if item_match:
                    item_type = item_match.group(1).strip()
                    requirements["other"].append({
                        "name": "Item",
                        "value": item_type,
                        "description": f"Possuir item {item_type}"
                    })
                    continue
                
                # Personality
                personality_match = re.search(r"(\w+)'s personnality is (\w+)", req_text)
                if personality_match:
                    personality = personality_match.group(2)
                    translated_personality = personality_translation.get(personality, personality)
                    requirements["other"].append({
                        "name": "Personalidade",
                        "value": translated_personality,
                        "description": f"Personalidade: {translated_personality}"
                    })
                    continue
                
                # Outros requisitos genéricos que não foram capturados
                if req_text and len(req_text) > 3:  # Evitar strings muito pequenas
                    print(f"  ⚠️  Requisito não reconhecido para {digimon_name}: {req_text}")
            
            # Remover seções vazias
            if not requirements["stats"]:
                del requirements["stats"]
            if not requirements["other"]:
                del requirements["other"]
            
            # Só adicionar se tiver requisitos
            if requirements:
                digimon_requirements[digimon_name] = requirements
                processed += 1
                
                # Debug para os primeiros
                if processed <= 5:
                    print(f"  ✅ {digimon_name}: {len(requirements.get('stats', []))} stats, {len(requirements.get('other', []))} outros")
                
                if processed % 50 == 0:
                    print(f"  Processados: {processed}")
        
        except Exception as e:
            print(f"  ⚠️  Erro ao processar Digimon: {e}")
            continue
    
    print(f"✅ Extraídos {len(digimon_requirements)} Digimons com requisitos")
    return digimon_requirements

def load_existing_data():
    """Carrega dados existentes"""
    data_file = "../src/assets/digimon_data.json"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar dados existentes: {e}")
        return None

def integrate_requirements(existing_data, html_requirements):
    """Integra requisitos extraídos do HTML"""
    print("🔄 Integrando requisitos do HTML...")
    
    # Inicializar seção de requisitos se não existir
    if "digimon_requirements" not in existing_data:
        existing_data["digimon_requirements"] = {}
    
    matched = 0
    not_found = 0
    updated = 0
    
    for digimon_name, requirements in html_requirements.items():
        # Tentar encontrar correspondência nos dados existentes
        found = False
        
        # Busca exata
        if digimon_name in existing_data["digimons"]:
            # Verificar se já existe e comparar
            if digimon_name in existing_data["digimon_requirements"]:
                updated += 1
            
            existing_data["digimon_requirements"][digimon_name] = requirements
            matched += 1
            found = True
        else:
            # Busca aproximada (remover caracteres especiais)
            clean_name = re.sub(r'[^\w\s]', '', digimon_name).strip()
            
            for existing_name in existing_data["digimons"]:
                clean_existing = re.sub(r'[^\w\s]', '', existing_name).strip()
                
                if clean_name.lower() == clean_existing.lower():
                    if existing_name in existing_data["digimon_requirements"]:
                        updated += 1
                    
                    existing_data["digimon_requirements"][existing_name] = requirements
                    matched += 1
                    found = True
                    break
        
        if not found:
            not_found += 1
            if not_found <= 10:  # Mostrar apenas os primeiros 10
                print(f"  ⚠️  Não encontrado: {digimon_name}")
    
    print(f"✅ Integrados: {matched}")
    print(f"🔄 Atualizados: {updated}")
    print(f"⚠️  Não encontrados: {not_found}")
    
    return existing_data

def save_updated_data(data):
    """Salva dados atualizados"""
    data_file = "../src/assets/digimon_data.json"
    backup_file = "../src/assets/digimon_data_backup_html.json"
    
    # Fazer backup
    try:
        if os.path.exists(data_file):
            with open(data_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            print(f"💾 Backup salvo: {backup_file}")
    except:
        pass
    
    # Salvar dados atualizados
    try:
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Dados atualizados salvos: {data_file}")
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")

def create_sample_output(html_requirements):
    """Cria exemplo de saída para verificação"""
    
    # Pegar alguns exemplos para mostrar
    sample_digimons = {}
    count = 0
    for name, req in html_requirements.items():
        if count < 5:
            sample_digimons[name] = req
            count += 1
        else:
            break
    
    with open("../src/assets/sample_extracted_requirements.json", 'w', encoding='utf-8') as f:
        json.dump(sample_digimons, f, ensure_ascii=False, indent=2)
    
    print("📋 Exemplos extraídos salvos: sample_extracted_requirements.json")

def main():
    print("🔄 Extração de Requisitos do HTML SkullBot - V2")
    print("=" * 50)
    
    # Verificar arquivos necessários
    html_file = "../upload/source.html"
    if not os.path.exists(html_file):
        print("❌ Arquivo HTML não encontrado!")
        return
    
    # Carregar HTML
    print("📄 Carregando HTML...")
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"❌ Erro ao carregar HTML: {e}")
        return
    
    # Extrair requisitos do HTML
    html_requirements = parse_requirements_from_html(html_content)
    
    if not html_requirements:
        print("❌ Nenhum requisito extraído do HTML")
        return
    
    # Criar exemplo de saída
    create_sample_output(html_requirements)
    
    # Carregar dados existentes
    existing_data = load_existing_data()
    
    if not existing_data:
        print("❌ Não foi possível carregar dados existentes")
        return
    
    # Integrar requisitos
    updated_data = integrate_requirements(existing_data, html_requirements)
    
    # Salvar dados atualizados
    save_updated_data(updated_data)
    
    print("\n✅ Processo concluído!")
    print("💡 Todos os requisitos do HTML foram integrados ao JSON")
    print("📋 Veja sample_extracted_requirements.json para verificar o formato")
    print("🚀 Agora pode testar a aplicação com todos os requisitos!")

if __name__ == "__main__":
    main()
