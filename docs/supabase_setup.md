# Configuração do Banco de Dados Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Configure o projeto:
   - **Name**: `digimon-evolution`
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

## Passo 2: Executar Schema SQL

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie e cole todo o conteúdo do arquivo `supabase_schema.sql`
4. Clique em "Run" para executar o script
5. Verifique se todas as tabelas foram criadas em **Table Editor**

## Passo 3: Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**

3. Configure as variáveis de ambiente:

```bash
export SUPABASE_URL='https://your-project-id.supabase.co'
export SUPABASE_ANON_KEY='your-anon-key-here'
```

## Passo 4: Instalar Dependências Python

```bash
pip install supabase python-dotenv
```

## Passo 5: Executar Migração de Dados

```bash
# Copiar o arquivo JSON para o diretório atual
cp /home/ubuntu/upload/digimon_data.json .

# Executar migração
python3 migrate_data.py digimon_data.json
```

## Passo 6: Verificar Dados

1. No **Table Editor** do Supabase, verifique:
   - **digimons**: Deve conter todos os Digimons
   - **evolutions**: Deve conter as relações evolutivas
   - **evolution_requirements**: Deve conter os requisitos

2. Teste algumas queries no **SQL Editor**:

```sql
-- Contar Digimons por stage
SELECT stage, COUNT(*) as total 
FROM digimons 
GROUP BY stage 
ORDER BY stage;

-- Buscar Digimons por nome
SELECT * FROM search_digimons('Agumon');

-- Testar linha evolutiva
SELECT * FROM get_evolution_line('Agumon');
```

## Configuração de Storage (Opcional)

Para hospedar as imagens dos Digimons:

1. Vá para **Storage** no dashboard
2. Crie um bucket chamado `digimon-images`
3. Configure como público:
   - **Public bucket**: Habilitado
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

4. Faça upload das imagens dos Digimons
5. Atualize a coluna `image_filename` com as URLs públicas

## Estrutura Final do Banco

```
digimons (1,000+ registros)
├── id (UUID, PK)
├── number (INTEGER, UNIQUE)
├── name (VARCHAR, UNIQUE)
├── stage (VARCHAR)
├── attribute (VARCHAR)
└── image_filename (VARCHAR)

evolutions (2,000+ registros)
├── id (UUID, PK)
├── from_digimon_id (UUID, FK)
└── to_digimon_id (UUID, FK)

evolution_requirements (500+ registros)
├── id (UUID, PK)
├── digimon_id (UUID, FK)
├── requirement_type (VARCHAR)
├── name (VARCHAR)
├── value (VARCHAR)
└── description (TEXT)
```

## Políticas de Segurança

O schema já inclui políticas RLS (Row Level Security) que permitem:
- **Leitura pública**: Todos podem consultar os dados
- **Escrita restrita**: Apenas usuários autenticados podem modificar

Para uma aplicação pública de consulta, isso é suficiente.

## Próximos Passos

Após a configuração do banco:
1. Desenvolver API Fastify
2. Configurar endpoints para consulta
3. Adaptar frontend React
4. Configurar Docker
5. Deploy no Render
