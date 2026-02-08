-- ============================================================
-- Rede Kids - Dados fictícios para teste
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SERVOS (12 servos)
-- ============================================================
INSERT INTO servants (name, phone) VALUES
  ('Ana Paula Silva',       '11987651234'),
  ('Carlos Eduardo Santos', '11976543210'),
  ('Débora Oliveira',       '11965432109'),
  ('Felipe Mendes',         '11954321098'),
  ('Gabriela Costa',        '11943210987'),
  ('Lucas Ferreira',        '11932109876'),
  ('Mariana Souza',         '11921098765'),
  ('Pedro Henrique Lima',   '11910987654'),
  ('Raquel Almeida',        '11998761234'),
  ('Thiago Barbosa',        '11987654321'),
  ('Vanessa Ribeiro',       '11976541234'),
  ('Wesley Nascimento',     '11965431234');

-- ============================================================
-- CRIANÇAS (24 crianças - faixa 2 a 9 anos)
-- Salas: Maternal (2-3), Jardim (4-6), Primário (7-9)
-- ============================================================

-- Maternal (2-3 anos) - nascidos em 2023/2024
INSERT INTO children (name, birth_date, guardian_name, guardian_relationship, phone) VALUES
  ('Helena Santos',     '2023-06-15', 'Juliana Santos',     'Mãe',  '11987650001'),
  ('Miguel Oliveira',   '2023-09-20', 'Fernanda Oliveira',  'Mãe',  '11987650002'),
  ('Arthur Costa',      '2024-03-10', 'Patrícia Costa',     'Mãe',  '11987650003'),
  ('Laura Ferreira',    '2024-01-05', 'Amanda Ferreira',    'Mãe',  '11987650004'),
  ('Theo Almeida',      '2023-04-12', 'Marcos Almeida',     'Pai',  '11987650005'),
  ('Alice Barbosa',     '2023-08-25', 'Renata Barbosa',     'Mãe',  '11987650006'),
  ('Davi Lima',         '2024-05-18', 'Ricardo Lima',        'Pai',  '11987650007'),
  ('Sophia Ribeiro',    '2023-12-03', 'Camila Ribeiro',     'Mãe',  '11987650008');

-- Jardim (4-6 anos) - nascidos em 2020/2021/2022
INSERT INTO children (name, birth_date, guardian_name, guardian_relationship, phone) VALUES
  ('Bernardo Souza',    '2021-05-22', 'Tatiana Souza',      'Mãe',  '11987650009'),
  ('Valentina Mendes',  '2020-07-30', 'Luciana Mendes',     'Mãe',  '11987650010'),
  ('Gabriel Nascimento','2021-03-14', 'Paulo Nascimento',   'Pai',  '11987650011'),
  ('Maria Luísa Pires', '2022-06-08', 'Sandra Pires',       'Mãe',  '11987650012'),
  ('Samuel Cardoso',    '2020-11-27', 'Adriana Cardoso',    'Mãe',  '11987650013'),
  ('Lívia Rocha',       '2022-02-19', 'Rodrigo Rocha',      'Pai',  '11987650014'),
  ('Enzo Martins',      '2021-09-05', 'Cláudia Martins',    'Mãe',  '11987650015'),
  ('Cecília Araújo',    '2020-08-12', 'Marcelo Araújo',     'Pai',  '11987650016');

-- Primário (7-9 anos) - nascidos em 2017/2018/2019
INSERT INTO children (name, birth_date, guardian_name, guardian_relationship, phone) VALUES
  ('Heitor Duarte',     '2018-05-30', 'Elaine Duarte',      'Mãe',  '11987650017'),
  ('Isabela Moreira',   '2019-01-22', 'Fábio Moreira',      'Pai',  '11987650018'),
  ('Lorenzo Teixeira',  '2017-07-15', 'Viviane Teixeira',   'Mãe',  '11987650019'),
  ('Manuela Castro',    '2018-04-09', 'Diego Castro',        'Pai',  '11987650020'),
  ('Rafael Correia',    '2019-10-30', 'Simone Correia',     'Mãe',  '11987650021'),
  ('Beatriz Vieira',    '2017-12-18', 'José Vieira',        'Pai',  '11987650022'),
  ('Gustavo Pereira',   '2018-06-25', 'Márcia Pereira',     'Mãe',  '11987650023'),
  ('Ana Clara Lopes',   '2019-03-11', 'Antônio Lopes',      'Avô',  '11987650024');

-- ============================================================
-- CULTOS (domingos de janeiro e fevereiro 2026)
-- ============================================================
INSERT INTO services (service_date, time_slot) VALUES
  ('2026-01-04', 'morning'), ('2026-01-04', 'evening'),
  ('2026-01-11', 'morning'), ('2026-01-11', 'evening'),
  ('2026-01-18', 'morning'), ('2026-01-18', 'evening'),
  ('2026-01-25', 'morning'), ('2026-01-25', 'evening'),
  ('2026-02-01', 'morning'), ('2026-02-01', 'evening');

-- ============================================================
-- ESCALAÇÃO DE SERVOS
-- ============================================================

-- Culto manhã 04/01
INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'maternal'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Ana Paula Silva';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'auxiliar', 'maternal'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Carlos Eduardo Santos';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'jardim'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Débora Oliveira';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'auxiliar', 'jardim'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Felipe Mendes';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'primario'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Gabriela Costa';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'auxiliar', 'primario'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning' AND sv.name = 'Lucas Ferreira';

-- Culto noite 04/01
INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'jardim'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'evening' AND sv.name = 'Vanessa Ribeiro';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'primario'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'evening' AND sv.name = 'Wesley Nascimento';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'maternal'
FROM services s, servants sv
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'evening' AND sv.name = 'Thiago Barbosa';

-- Culto manhã 11/01
INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'maternal'
FROM services s, servants sv
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning' AND sv.name = 'Pedro Henrique Lima';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'auxiliar', 'maternal'
FROM services s, servants sv
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning' AND sv.name = 'Raquel Almeida';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'jardim'
FROM services s, servants sv
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning' AND sv.name = 'Ana Paula Silva';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'professor', 'primario'
FROM services s, servants sv
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning' AND sv.name = 'Mariana Souza';

INSERT INTO service_servants (service_id, servant_id, role, classroom)
SELECT s.id, sv.id, 'auxiliar', 'primario'
FROM services s, servants sv
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning' AND sv.name = 'Gabriela Costa';

-- ============================================================
-- PRESENÇAS
-- ============================================================

-- Culto manhã 04/01 - Maternal
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'maternal'
FROM services s, children c
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning'
  AND c.name IN ('Helena Santos', 'Miguel Oliveira', 'Arthur Costa', 'Theo Almeida', 'Alice Barbosa');

-- Culto manhã 04/01 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning'
  AND c.name IN ('Bernardo Souza', 'Gabriel Nascimento', 'Maria Luísa Pires', 'Samuel Cardoso', 'Enzo Martins', 'Cecília Araújo');

-- Culto manhã 04/01 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning'
  AND c.name IN ('Heitor Duarte', 'Isabela Moreira', 'Lorenzo Teixeira', 'Manuela Castro', 'Rafael Correia');

-- Visitante culto manhã 04/01
INSERT INTO attendance (service_id, is_visitor, visitor_name, visitor_birth_date, visitor_guardian_name, visitor_phone, classroom)
SELECT s.id, true, 'Benício Marques', '2021-07-20', 'Carla Marques', '11999990001', 'jardim'
FROM services s
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'morning';

-- Culto noite 04/01 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'evening'
  AND c.name IN ('Gabriel Nascimento', 'Lívia Rocha', 'Valentina Mendes');

-- Culto noite 04/01 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-01-04' AND s.time_slot = 'evening'
  AND c.name IN ('Beatriz Vieira', 'Gustavo Pereira', 'Ana Clara Lopes');

-- Culto manhã 11/01 - Maternal
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'maternal'
FROM services s, children c
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning'
  AND c.name IN ('Helena Santos', 'Laura Ferreira', 'Davi Lima', 'Alice Barbosa', 'Sophia Ribeiro');

-- Culto manhã 11/01 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning'
  AND c.name IN ('Maria Luísa Pires', 'Samuel Cardoso', 'Lívia Rocha', 'Enzo Martins', 'Valentina Mendes');

-- Culto manhã 11/01 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning'
  AND c.name IN ('Isabela Moreira', 'Manuela Castro', 'Gustavo Pereira', 'Heitor Duarte', 'Ana Clara Lopes');

-- Visitante culto manhã 11/01
INSERT INTO attendance (service_id, is_visitor, visitor_name, visitor_birth_date, visitor_guardian_name, visitor_phone, classroom)
SELECT s.id, true, 'Liz Fonseca', '2018-03-15', 'Patrícia Fonseca', '11999990002', 'primario'
FROM services s
WHERE s.service_date = '2026-01-11' AND s.time_slot = 'morning';

-- Culto manhã 18/01 - Maternal
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'maternal'
FROM services s, children c
WHERE s.service_date = '2026-01-18' AND s.time_slot = 'morning'
  AND c.name IN ('Theo Almeida', 'Davi Lima', 'Miguel Oliveira', 'Laura Ferreira');

-- Culto manhã 18/01 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-01-18' AND s.time_slot = 'morning'
  AND c.name IN ('Gabriel Nascimento', 'Maria Luísa Pires', 'Bernardo Souza', 'Cecília Araújo');

-- Culto manhã 18/01 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-01-18' AND s.time_slot = 'morning'
  AND c.name IN ('Lorenzo Teixeira', 'Rafael Correia', 'Beatriz Vieira', 'Gustavo Pereira');

-- Culto manhã 25/01 - Maternal
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'maternal'
FROM services s, children c
WHERE s.service_date = '2026-01-25' AND s.time_slot = 'morning'
  AND c.name IN ('Helena Santos', 'Arthur Costa', 'Alice Barbosa', 'Theo Almeida', 'Sophia Ribeiro');

-- Culto manhã 25/01 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-01-25' AND s.time_slot = 'morning'
  AND c.name IN ('Gabriel Nascimento', 'Samuel Cardoso', 'Lívia Rocha', 'Enzo Martins', 'Valentina Mendes');

-- Culto manhã 25/01 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-01-25' AND s.time_slot = 'morning'
  AND c.name IN ('Isabela Moreira', 'Manuela Castro', 'Heitor Duarte', 'Ana Clara Lopes');

-- Culto manhã 01/02 - Maternal
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'maternal'
FROM services s, children c
WHERE s.service_date = '2026-02-01' AND s.time_slot = 'morning'
  AND c.name IN ('Alice Barbosa', 'Miguel Oliveira', 'Davi Lima');

-- Culto manhã 01/02 - Jardim
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'jardim'
FROM services s, children c
WHERE s.service_date = '2026-02-01' AND s.time_slot = 'morning'
  AND c.name IN ('Gabriel Nascimento', 'Maria Luísa Pires', 'Bernardo Souza', 'Cecília Araújo');

-- Culto manhã 01/02 - Primário
INSERT INTO attendance (service_id, child_id, is_visitor, classroom)
SELECT s.id, c.id, false, 'primario'
FROM services s, children c
WHERE s.service_date = '2026-02-01' AND s.time_slot = 'morning'
  AND c.name IN ('Isabela Moreira', 'Manuela Castro', 'Lorenzo Teixeira');
