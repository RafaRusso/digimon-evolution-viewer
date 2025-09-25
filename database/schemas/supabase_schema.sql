-- Schema para o banco de dados Digimon Evolution no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de Digimons
CREATE TABLE digimons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    stage VARCHAR(50) NOT NULL,
    attribute VARCHAR(50) NOT NULL,
    image_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de evoluções (relacionamento many-to-many)
CREATE TABLE evolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_digimon_id UUID NOT NULL REFERENCES digimons(id) ON DELETE CASCADE,
    to_digimon_id UUID NOT NULL REFERENCES digimons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_digimon_id, to_digimon_id)
);

-- Tabela de requisitos de evolução
CREATE TABLE evolution_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    digimon_id UUID NOT NULL REFERENCES digimons(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50) NOT NULL, -- 'stats' ou 'other'
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_digimons_name ON digimons(name);
CREATE INDEX idx_digimons_stage ON digimons(stage);
CREATE INDEX idx_digimons_attribute ON digimons(attribute);
CREATE INDEX idx_digimons_number ON digimons(number);

CREATE INDEX idx_evolutions_from ON evolutions(from_digimon_id);
CREATE INDEX idx_evolutions_to ON evolutions(to_digimon_id);

CREATE INDEX idx_requirements_digimon ON evolution_requirements(digimon_id);
CREATE INDEX idx_requirements_type ON evolution_requirements(requirement_type);

-- Função para busca de texto
CREATE OR REPLACE FUNCTION search_digimons(search_term TEXT)
RETURNS TABLE (
    id UUID,
    number INTEGER,
    name VARCHAR(255),
    stage VARCHAR(50),
    attribute VARCHAR(50),
    image_filename VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.number, d.name, d.stage, d.attribute, d.image_filename
    FROM digimons d
    WHERE d.name ILIKE '%' || search_term || '%'
    ORDER BY d.name;
END;
$$ LANGUAGE plpgsql;

-- Função para obter linha evolutiva completa
CREATE OR REPLACE FUNCTION get_evolution_line(digimon_name TEXT)
RETURNS TABLE (
    digimon_id UUID,
    digimon_name VARCHAR(255),
    digimon_number INTEGER,
    digimon_stage VARCHAR(50),
    digimon_attribute VARCHAR(50),
    digimon_image VARCHAR(255),
    evolution_type VARCHAR(20) -- 'current', 'predecessor', 'successor'
) AS $$
DECLARE
    target_id UUID;
BEGIN
    -- Buscar o ID do Digimon alvo
    SELECT id INTO target_id FROM digimons WHERE name = digimon_name;
    
    IF target_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Retornar o Digimon atual
    RETURN QUERY
    SELECT d.id, d.name, d.number, d.stage, d.attribute, d.image_filename, 'current'::VARCHAR(20)
    FROM digimons d
    WHERE d.id = target_id;
    
    -- Retornar predecessores (recursivo)
    WITH RECURSIVE predecessors AS (
        SELECT e.from_digimon_id as digimon_id, 1 as level
        FROM evolutions e
        WHERE e.to_digimon_id = target_id
        
        UNION ALL
        
        SELECT e.from_digimon_id, p.level + 1
        FROM evolutions e
        JOIN predecessors p ON e.to_digimon_id = p.digimon_id
        WHERE p.level < 10 -- Limite para evitar loops infinitos
    )
    SELECT d.id, d.name, d.number, d.stage, d.attribute, d.image_filename, 'predecessor'::VARCHAR(20)
    FROM predecessors p
    JOIN digimons d ON p.digimon_id = d.id;
    
    -- Retornar sucessores (recursivo)
    WITH RECURSIVE successors AS (
        SELECT e.to_digimon_id as digimon_id, 1 as level
        FROM evolutions e
        WHERE e.from_digimon_id = target_id
        
        UNION ALL
        
        SELECT e.to_digimon_id, s.level + 1
        FROM evolutions e
        JOIN successors s ON e.from_digimon_id = s.digimon_id
        WHERE s.level < 10 -- Limite para evitar loops infinitos
    )
    SELECT d.id, d.name, d.number, d.stage, d.attribute, d.image_filename, 'successor'::VARCHAR(20)
    FROM successors s
    JOIN digimons d ON s.digimon_id = d.id;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_digimons_updated_at
    BEFORE UPDATE ON digimons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) para Supabase
ALTER TABLE digimons ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_requirements ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para a aplicação web)
CREATE POLICY "Allow public read access on digimons" ON digimons
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on evolutions" ON evolutions
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on evolution_requirements" ON evolution_requirements
    FOR SELECT USING (true);

-- Comentários para documentação
COMMENT ON TABLE digimons IS 'Tabela principal contendo informações dos Digimons';
COMMENT ON TABLE evolutions IS 'Tabela de relacionamento para evoluções entre Digimons';
COMMENT ON TABLE evolution_requirements IS 'Requisitos necessários para evolução de cada Digimon';

COMMENT ON COLUMN digimons.number IS 'Número único do Digimon na enciclopédia';
COMMENT ON COLUMN digimons.stage IS 'Estágio evolutivo (I, II, III, IV, V, VI, VI+, Human Hybrid, Beast Hybrid)';
COMMENT ON COLUMN digimons.attribute IS 'Atributo do Digimon (Vaccine, Data, Virus, Variable, N/A)';
COMMENT ON COLUMN digimons.image_filename IS 'Nome do arquivo de imagem do Digimon';

COMMENT ON COLUMN evolution_requirements.requirement_type IS 'Tipo de requisito: stats ou other';
COMMENT ON COLUMN evolution_requirements.name IS 'Nome do requisito (ex: HP, Patente, Item)';
COMMENT ON COLUMN evolution_requirements.value IS 'Valor necessário do requisito';
COMMENT ON COLUMN evolution_requirements.description IS 'Descrição detalhada do requisito';
