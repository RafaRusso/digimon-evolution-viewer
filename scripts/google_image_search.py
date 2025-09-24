#!/usr/bin/env python3.11
"""
Script para Buscar Imagens Faltantes no Google
- Busca apenas Digimons que não têm imagem
- Usa Google Custom Search API (ou fallback para placeholder)
- Mantém padrão de nomenclatura existente
"""

import json
import os
import requests
import time
from urllib.parse import quote
import re

def sanitize_filename(name):
    """Converte nome do Digimon para nome de arquivo seguro"""
    safe_name = re.sub(r'[^\w\-_\.\s]', '_', name)
    safe_name = re.sub(r'\s+', '_', safe_name)
    return safe_name

def download_image(url, filepath):
    """Baixa uma imagem de uma URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Verificar tamanho mínimo (evitar imagens muito pequenas)
        if len(response.content) < 1000:  # Menos de 1KB
            return False
        
        # Salvar imagem
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception:
        return False

def search_google_images(digimon_name, api_key=None, search_engine_id=None):
    """
    Busca imagens no Google usando Custom Search API
    Se não tiver API key, retorna URLs de placeholder
    """
    
    # Se tiver API key do Google, usar busca real
    if api_key and search_engine_id:
        try:
            search_url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': api_key,
                'cx': search_engine_id,
                'q': f"{digimon_name} digimon",
                'searchType': 'image',
                'num': 3,
                'imgSize': 'medium',
                'imgType': 'photo'
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'items' in data:
                return [item['link'] for item in data['items'][:3]]
        
        except Exception as e:
            print(f"    Erro na API do Google: {e}")
    
    # Fallback: URLs de placeholder coloridos
    colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F']
    color = colors[hash(digimon_name) % len(colors)]
    
    # Texto para o placeholder
    text = digimon_name.replace(' ', '+')[:12]
    
    return [
        f"https://via.placeholder.com/300x300/{color}/FFFFFF?text={quote(text)}",
        f"https://via.placeholder.com/250x250/{color}/000000?text={quote(text[:8])}",
        f"https://via.placeholder.com/200x200/{color}/FFFFFF?text=Digimon"
    ]

def get_missing_digimons():
    """Identifica Digimons sem imagem"""
    
    data_file = "../src/assets/digimon_data.json"
    images_dir = "../src/assets/images"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar dados: {e}")
        return []
    
    missing = []
    
    for digimon_name in data['digimons']:
        safe_name = sanitize_filename(digimon_name)
        possible_files = [
            f"{safe_name}.jpg",
            f"{safe_name}.jpeg", 
            f"{safe_name}.png"
        ]
        
        # Verificar se existe alguma imagem
        has_image = False
        for filename in possible_files:
            filepath = os.path.join(images_dir, filename)
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                has_image = True
                break
        
        if not has_image:
            missing.append(digimon_name)
    
    return missing

def download_missing_images():
    """Baixa imagens para Digimons que não têm"""
    
    # Configuração da API do Google (opcional)
    # Para usar busca real do Google, defina estas variáveis:
    GOOGLE_API_KEY = 'AIzaSyCztKYhnNhhYOrQ3RKUPc9vIiHhKC946lw'  # Sua API key aqui
    SEARCH_ENGINE_ID = 'a34efcc044067490b'  # Seu Search Engine ID aqui
    
    images_dir = "../src/assets/images"
    os.makedirs(images_dir, exist_ok=True)
    
    # Identificar Digimons sem imagem
    missing_digimons = get_missing_digimons()
    
    if not missing_digimons:
        print("✅ Todos os Digimons já têm imagens!")
        return
    
    print(f"🎯 Encontrados {len(missing_digimons)} Digimons sem imagem")
    print("🔍 Buscando imagens...")
    
    if not GOOGLE_API_KEY:
        print("💡 Usando placeholders coloridos (para busca real, configure Google API)")
    
    stats = {
        'success': 0,
        'failed': 0
    }
    
    for i, digimon_name in enumerate(missing_digimons, 1):
        print(f"[{i:3d}/{len(missing_digimons)}] {digimon_name}...", end=' ')
        
        safe_name = sanitize_filename(digimon_name)
        filename = f"{safe_name}.jpg"
        filepath = os.path.join(images_dir, filename)
        
        # Buscar URLs de imagens
        image_urls = search_google_images(
            digimon_name, 
            GOOGLE_API_KEY, 
            SEARCH_ENGINE_ID
        )
        
        # Tentar baixar cada URL até conseguir
        downloaded = False
        for url in image_urls:
            if download_image(url, filepath):
                print("✅")
                stats['success'] += 1
                downloaded = True
                break
            time.sleep(0.2)  # Pausa pequena entre tentativas
        
        if not downloaded:
            print("❌")
            stats['failed'] += 1
        
        # Pausa entre Digimons
        time.sleep(0.5)
    
    # Atualizar JSON
    update_json_references()
    
    # Mostrar estatísticas
    print(f"\n📊 Resultado:")
    print(f"  ✅ Sucessos: {stats['success']}")
    print(f"  ❌ Falhas: {stats['failed']}")
    
    if stats['success'] > 0:
        success_rate = (stats['success'] / len(missing_digimons)) * 100
        print(f"  📈 Taxa de sucesso: {success_rate:.1f}%")

def update_json_references():
    """Atualiza referências no JSON baseado nas imagens existentes"""
    
    data_file = "../src/assets/digimon_data.json"
    images_dir = "../src/assets/images"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar JSON: {e}")
        return
    
    # Verificar imagens existentes
    existing_images = set()
    if os.path.exists(images_dir):
        existing_images = {f for f in os.listdir(images_dir) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))}
    
    # Atualizar dados
    updated = 0
    for digimon_name in data['digimons']:
        safe_name = sanitize_filename(digimon_name)
        possible_files = [
            f"{safe_name}.jpg",
            f"{safe_name}.jpeg", 
            f"{safe_name}.png"
        ]
        
        # Procurar arquivo existente
        found_file = None
        for possible_file in possible_files:
            if possible_file in existing_images:
                # Verificar se arquivo não está vazio
                filepath = os.path.join(images_dir, possible_file)
                if os.path.getsize(filepath) > 1000:  # Maior que 1KB
                    found_file = possible_file
                    break
        
        # Atualizar referência
        old_image = data['digimons'][digimon_name].get('image')
        data['digimons'][digimon_name]['image'] = found_file
        
        if old_image != found_file:
            updated += 1
    
    # Salvar
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 JSON atualizado ({updated} mudanças)")

def main():
    print("🔍 Busca de Imagens Faltantes no Google")
    print("=" * 45)
    
    # Verificar arquivos necessários
    required_files = [
        "../src/assets/digimon_data.json"
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            print(f"❌ Arquivo não encontrado: {file}")
            return
    
    download_missing_images()
    
    print("\n✅ Processo concluído!")
    print("💡 Execute 'cd digimon-evolution-viewer && pnpm run build' para atualizar")
    print("\n🔧 Para busca real no Google:")
    print("   1. Crie uma API key no Google Cloud Console")
    print("   2. Configure um Custom Search Engine")
    print("   3. Defina GOOGLE_API_KEY e SEARCH_ENGINE_ID no script")

if __name__ == "__main__":
    main()
