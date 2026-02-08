-- Adiciona coluna para armazenar o parentesco do responsável do visitante
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS visitor_guardian_relationship TEXT;
