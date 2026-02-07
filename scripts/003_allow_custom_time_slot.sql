-- Remove a constraint que limita time_slot a 'morning' e 'evening'
-- para permitir horários personalizados (eventos especiais)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_time_slot_check;
