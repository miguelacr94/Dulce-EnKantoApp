-- Script para configurar la base de datos de Dulce Enkanto
-- Ejecutar esto en el SQL Editor de Supabase

-- Crear tabla de clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_producto TEXT NOT NULL CHECK (tipo_producto IN ('torta', 'cupcake')),
  peso NUMERIC NOT NULL CHECK (peso > 0),
  sabor TEXT NOT NULL,
  descripcion TEXT,
  precio_total NUMERIC NOT NULL CHECK (precio_total > 0),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'entregado', 'cancelado')),
  fecha_entrega DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de abonos
CREATE TABLE abonos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_pedidos_fecha_entrega ON pedidos(fecha_entrega);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_abonos_pedido_id ON abonos(pedido_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (permitir todo para esta app simple)
CREATE POLICY "Allow all operations on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on abonos" ON abonos FOR ALL USING (true) WITH CHECK (true);

-- Opcional: Insertar datos de prueba
INSERT INTO clientes (nombre, telefono, direccion) VALUES
('María González', '3001234567', 'Calle 123 #45-67, Bogotá'),
('Juan Pérez', '3109876543', 'Avenida 78 #90-12, Medellín'),
('Ana López', '3204567890', 'Carrera 45 #67-89, Cali');

-- Crear tabla de productos si no existe
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_producto TEXT CHECK (tipo_producto IN ('torta', 'cupcake')),
  precio NUMERIC CHECK (precio >= 0),
  descripcion TEXT,
  tipo_medida TEXT CHECK (tipo_medida IN ('peso', 'tamano')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de sabores si no existe
CREATE TABLE IF NOT EXISTS sabores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tamaños si no existe
CREATE TABLE IF NOT EXISTS tamanos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('peso', 'tamano')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos_sabores si no existe
CREATE TABLE IF NOT EXISTS productos_sabores (
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  sabor_id UUID REFERENCES sabores(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, sabor_id)
);

-- Crear tabla de productos_tamanos si no existe
CREATE TABLE IF NOT EXISTS productos_tamanos (
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  tamano_id UUID REFERENCES tamanos(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, tamano_id)
);

-- Insertar datos de ejemplo para tamaños
INSERT INTO tamanos (nombre, tipo) VALUES
('1 libra', 'peso'),
('2 libras', 'peso'),
('3 libras', 'peso'),
('4 libras', 'peso'),
('5 libras', 'peso'),
('Pequeño', 'tamano'),
('Mediano', 'tamano'),
('Grande', 'tamano'),
('Extra Grande', 'tamano')
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para sabores
INSERT INTO sabores (nombre) VALUES
('Chocolate'),
('Vainilla'),
('Fresa'),
('Arequipe'),
('Limon'),
('Mora')
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo con tipo_medida
INSERT INTO productos (nombre, tipo_producto, precio, descripcion, tipo_medida) VALUES
('Torta de Chocolate', 'torta', 50000, 'Deliciosa torta de chocolate', 'peso'),
('Torta de Vainilla', 'torta', 45000, 'Clásica torta de vainilla', 'peso'),
('Torta de Fresa', 'torta', 48000, 'Fresca torta de fresa', 'peso'),
('Cupcake de Chocolate', 'cupcake', 8000, 'Cupcake individual de chocolate', 'tamano'),
('Cupcake de Vainilla', 'cupcake', 7000, 'Cupcake individual de vainilla', 'tamano')
ON CONFLICT DO NOTHING;

-- Asociar tamaños a productos (ejemplo)
INSERT INTO productos_tamanos (producto_id, tamano_id)
SELECT p.id, t.id 
FROM productos p, tamanos t 
WHERE p.tipo_medida = t.tipo
ON CONFLICT DO NOTHING;

-- Asociar sabores a productos (ejemplo)
INSERT INTO productos_sabores (producto_id, sabor_id)
SELECT p.id, s.id 
FROM productos p, sabores s 
ON CONFLICT DO NOTHING;

-- Agregar columna tipo_medida a la tabla productos (si existe)
-- ALTER TABLE productos ADD COLUMN tipo_medida TEXT CHECK (tipo_medida IN ('peso', 'tamano'));

-- Nota: Si la tabla productos ya existe, ejecuta esta línea en el SQL Editor de Supabase:
-- ALTER TABLE productos ADD COLUMN tipo_medida TEXT CHECK (tipo_medida IN ('peso', 'tamano'));

INSERT INTO pedidos (cliente_id, tipo_producto, peso, sabor, descripcion, precio_total, fecha_entrega) VALUES
((SELECT id FROM clientes WHERE nombre = 'María González'), 'torta', 3, 'Chocolate', 'Torta de 3 libras con relleno de arequipe', 150000, CURRENT_DATE + 3),
((SELECT id FROM clientes WHERE nombre = 'Juan Pérez'), 'cupcake', 12, 'Vainilla', '12 cupcakes con vainilla y chispas', 60000, CURRENT_DATE + 2),
((SELECT id FROM clientes WHERE nombre = 'Ana López'), 'torta', 2, 'Fresa', 'Torta de 2 libras con crema y fresas', 120000, CURRENT_DATE + 5);

INSERT INTO abonos (pedido_id, monto, fecha) VALUES
((SELECT id FROM pedidos WHERE sabor = 'Chocolate'), 50000, CURRENT_DATE),
((SELECT id FROM pedidos WHERE sabor = 'Vainilla'), 30000, CURRENT_DATE);
