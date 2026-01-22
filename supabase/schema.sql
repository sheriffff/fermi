-- =====================================================
-- ESQUEMA SQL PARA SUPABASE - FERMI TESTS TFM
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- -----------------------------------------------------
-- 1. TABLA: profesores
-- Almacena información de profesores y genera códigos de grupo
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS profesores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_grupo VARCHAR(8) UNIQUE NOT NULL,  -- Código corto para pizarra (ej: ABC123)
    nombre VARCHAR(255),                       -- Opcional
    centro VARCHAR(255),                       -- Opcional
    alumnos_previstos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por código
CREATE INDEX idx_profesores_codigo ON profesores(codigo_grupo);

-- -----------------------------------------------------
-- 2. TABLA: log_descargas
-- Registro de cada descarga de PDF realizada
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS log_descargas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_profe UUID REFERENCES profesores(id) ON DELETE CASCADE,
    archivo VARCHAR(50) NOT NULL,              -- Ej: 'ModeloA.pdf', 'Instrucciones.pdf'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para análisis por profesor
CREATE INDEX idx_log_descargas_profe ON log_descargas(id_profe);

-- -----------------------------------------------------
-- 3. TABLA: respuestas_online
-- Respuestas de adultos que realizan el test online
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS respuestas_online (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Metadata del participante
    edad INTEGER NOT NULL CHECK (edad >= 18 AND edad <= 120),
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
    pi_vs_e VARCHAR(10) NOT NULL CHECK (pi_vs_e IN ('si', 'no', 'no_se')),
    segunda_vez BOOLEAN DEFAULT FALSE,
    -- Datos del test
    modelo CHAR(1) NOT NULL CHECK (modelo IN ('A', 'B', 'C', 'D')),
    respuestas JSONB NOT NULL,                 -- { "p1": 5200000, "p2": 340, ... }
    tiempos JSONB NOT NULL,                    -- { "p1": 45, "p2": 120, ... } en segundos
    -- Metadatos
    user_agent TEXT,                           -- Para análisis técnico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para análisis
CREATE INDEX idx_respuestas_online_modelo ON respuestas_online(modelo);
CREATE INDEX idx_respuestas_online_fecha ON respuestas_online(created_at);

-- -----------------------------------------------------
-- 4. TABLA: respuestas_papel
-- Entrada manual de exámenes en papel desde /admin
-- Formato: a × 10^b para cada respuesta
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS respuestas_papel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_grupo UUID REFERENCES profesores(id) ON DELETE CASCADE,
    modelo CHAR(1) NOT NULL CHECK (modelo IN ('A', 'B', 'C', 'D')),
    alumno_idx INTEGER NOT NULL,               -- Número de alumno dentro del grupo (1, 2, 3...)
    pregunta_num INTEGER NOT NULL,             -- Número de pregunta (1-12)
    base_a NUMERIC(10, 2) NOT NULL,            -- Parte "a" de a × 10^b
    exp_b INTEGER NOT NULL,                    -- Exponente "b" de a × 10^b
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraint único para evitar duplicados
    CONSTRAINT unique_respuesta_papel UNIQUE (id_grupo, alumno_idx, pregunta_num)
);

-- Índices para consultas
CREATE INDEX idx_respuestas_papel_grupo ON respuestas_papel(id_grupo);
CREATE INDEX idx_respuestas_papel_modelo ON respuestas_papel(modelo);

-- -----------------------------------------------------
-- 5. TABLA: preguntas
-- Banco de preguntas por modelo
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS preguntas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modelo CHAR(1) NOT NULL CHECK (modelo IN ('A', 'B', 'C', 'D')),
    numero INTEGER NOT NULL,                   -- Orden dentro del modelo (1-12)
    texto TEXT NOT NULL,                       -- Texto de la pregunta
    unidad VARCHAR(50),                        -- Unidad esperada (ej: "km", "personas", "litros")
    valor_referencia NUMERIC,                  -- Valor "correcto" de referencia (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_pregunta UNIQUE (modelo, numero)
);

-- Índice para obtener preguntas por modelo
CREATE INDEX idx_preguntas_modelo ON preguntas(modelo, numero);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_descargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_online ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_papel ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- POLÍTICAS PÚBLICAS (para formularios anónimos)
-- -----------------------------------------------------

-- Profesores: pueden registrarse (INSERT) y ver su propio código
CREATE POLICY "Permitir registro de profesores" ON profesores
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de profesores" ON profesores
    FOR SELECT TO anon USING (true);

-- Log descargas: permitir inserts desde el frontend
CREATE POLICY "Permitir registro de descargas" ON log_descargas
    FOR INSERT TO anon WITH CHECK (true);

-- Respuestas online: permitir envío de respuestas
CREATE POLICY "Permitir envío de respuestas online" ON respuestas_online
    FOR INSERT TO anon WITH CHECK (true);

-- Respuestas papel: solo admin (authenticated) puede insertar
CREATE POLICY "Admin puede insertar respuestas papel" ON respuestas_papel
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin puede leer respuestas papel" ON respuestas_papel
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin puede actualizar respuestas papel" ON respuestas_papel
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin puede eliminar respuestas papel" ON respuestas_papel
    FOR DELETE TO authenticated USING (true);

-- Preguntas: lectura pública
CREATE POLICY "Lectura pública de preguntas" ON preguntas
    FOR SELECT TO anon USING (true);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar código de grupo corto y único
CREATE OR REPLACE FUNCTION generate_codigo_grupo()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Sin I, O, 1, 0 para evitar confusión
    result VARCHAR(8) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar código al insertar profesor
CREATE OR REPLACE FUNCTION trigger_set_codigo_grupo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_grupo IS NULL OR NEW.codigo_grupo = '' THEN
        NEW.codigo_grupo := generate_codigo_grupo();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_codigo_grupo_on_insert
    BEFORE INSERT ON profesores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_codigo_grupo();

-- =====================================================
-- DATOS INICIALES: Preguntas de ejemplo
-- (Reemplazar con las preguntas reales del TFM)
-- =====================================================

-- Modelo A - Preguntas de ejemplo
INSERT INTO preguntas (modelo, numero, texto, unidad) VALUES
('A', 1, '¿Cuántos granos de arena hay en una playa de 100 metros de largo?', 'granos'),
('A', 2, '¿Cuántos litros de agua consume una persona al año?', 'litros'),
('A', 3, '¿Cuántos árboles hay en España?', 'árboles'),
('A', 4, '¿Cuántos kilómetros recorre la Tierra alrededor del Sol en un año?', 'km'),
('A', 5, '¿Cuántas pizzas se comen en España en un día?', 'pizzas'),
('A', 6, '¿Cuántos latidos da el corazón humano en 70 años?', 'latidos'),
('A', 7, '¿Cuántos profesores de secundaria hay en España?', 'profesores'),
('A', 8, '¿Cuántas palabras pronuncia una persona promedio al día?', 'palabras');

-- Modelo B - Preguntas de ejemplo
INSERT INTO preguntas (modelo, numero, texto, unidad) VALUES
('B', 1, '¿Cuántos coches hay actualmente en Madrid?', 'coches'),
('B', 2, '¿Cuántos pelos tiene una persona en la cabeza?', 'pelos'),
('B', 3, '¿Cuántos vuelos comerciales hay al día en el mundo?', 'vuelos'),
('B', 4, '¿Cuántos metros cuadrados tiene el campus de una universidad media?', 'm²'),
('B', 5, '¿Cuántas botellas de agua de 1L caben en una piscina olímpica?', 'botellas'),
('B', 6, '¿Cuántos médicos hay trabajando en España?', 'médicos'),
('B', 7, '¿Cuántos SMS se enviaban al día en España en 2010?', 'SMS'),
('B', 8, '¿Cuántos kilómetros de carreteras hay en España?', 'km');

-- Modelo C - Preguntas de ejemplo
INSERT INTO preguntas (modelo, numero, texto, unidad) VALUES
('C', 1, '¿Cuántas estrellas puede ver una persona a simple vista en una noche clara?', 'estrellas'),
('C', 2, '¿Cuántos estudiantes universitarios hay en España?', 'estudiantes'),
('C', 3, '¿Cuántas toneladas de basura genera una ciudad de 1 millón de habitantes al año?', 'toneladas'),
('C', 4, '¿Cuántos restaurantes hay en Barcelona?', 'restaurantes'),
('C', 5, '¿Cuántos libros diferentes se han publicado en la historia de la humanidad?', 'libros'),
('C', 6, '¿Cuántas veces late el corazón de un colibrí en un minuto?', 'latidos'),
('C', 7, '¿Cuántos teléfonos móviles se venden al año en el mundo?', 'móviles'),
('C', 8, '¿Cuántos caracteres tiene un libro de 300 páginas?', 'caracteres');

-- Modelo D - Preguntas de ejemplo
INSERT INTO preguntas (modelo, numero, texto, unidad) VALUES
('D', 1, '¿Cuántos litros de petróleo consume el mundo en un día?', 'litros'),
('D', 2, '¿Cuántas hormigas hay en una colonia típica?', 'hormigas'),
('D', 3, '¿Cuántos fotogramas tiene una película de 2 horas?', 'fotogramas'),
('D', 4, '¿Cuántos correos electrónicos se envían al día en el mundo?', 'emails'),
('D', 5, '¿Cuántas neuronas tiene el cerebro humano?', 'neuronas'),
('D', 6, '¿Cuántos kilogramos de comida consume una persona al año?', 'kg'),
('D', 7, '¿Cuántos ascensores hay en Nueva York?', 'ascensores'),
('D', 8, '¿Cuántos segundos tiene una vida de 80 años?', 'segundos');

-- =====================================================
-- VISTAS ÚTILES PARA EXPORTACIÓN
-- =====================================================

-- Vista consolidada de respuestas online para análisis
CREATE OR REPLACE VIEW vista_respuestas_online AS
SELECT
    id,
    edad,
    sexo,
    pi_vs_e,
    segunda_vez,
    modelo,
    respuestas,
    tiempos,
    created_at
FROM respuestas_online
ORDER BY created_at DESC;

-- Vista consolidada de respuestas papel
CREATE OR REPLACE VIEW vista_respuestas_papel AS
SELECT
    rp.id,
    p.codigo_grupo,
    rp.modelo,
    rp.alumno_idx,
    rp.pregunta_num,
    rp.base_a,
    rp.exp_b,
    (rp.base_a * POWER(10, rp.exp_b)) as valor_calculado,
    rp.created_at
FROM respuestas_papel rp
JOIN profesores p ON rp.id_grupo = p.id
ORDER BY p.codigo_grupo, rp.alumno_idx, rp.pregunta_num;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
