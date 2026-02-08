-- Rede Kids Database Schema

-- Drop tables in correct order (dependents first)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS service_servants CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS servants CASCADE;
DROP TABLE IF EXISTS children CASCADE;

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Servants table
CREATE TABLE servants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services table (each Sunday service)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_date, time_slot)
);

-- Service servants (who served and in what role per classroom)
CREATE TABLE service_servants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  servant_id UUID NOT NULL REFERENCES servants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('professor', 'auxiliar')),
  classroom TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  is_visitor BOOLEAN DEFAULT false,
  visitor_name TEXT,
  visitor_birth_date DATE,
  visitor_guardian_name TEXT,
  visitor_phone TEXT,
  classroom TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS with open policies (internal church tool)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on children" ON children FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE servants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on servants" ON servants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on services" ON services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE service_servants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on service_servants" ON service_servants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_children_active ON children(active);
CREATE INDEX idx_children_birth_date ON children(birth_date);
CREATE INDEX idx_servants_active ON servants(active);
CREATE INDEX idx_services_date ON services(service_date);
CREATE INDEX idx_attendance_service ON attendance(service_id);
CREATE INDEX idx_service_servants_service ON service_servants(service_id);
