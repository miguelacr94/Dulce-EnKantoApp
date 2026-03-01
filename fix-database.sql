-- Script para corregir la base de datos eliminando tipo_producto
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura actual de la tabla productos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. Eliminar la columna tipo_producto si existe (descomentar si necesitas eliminarla)
-- ALTER TABLE productos DROP COLUMN IF EXISTS tipo_producto;

-- 3. Limpiar datos existentes e insertar productos correctos
DELETE FROM productos;

-- 4. Insertar productos de ejemplo sin tipo_producto
INSERT INTO productos (nombre, precio, descripcion, tipo_medida) VALUES
('Torta de Chocolate', 50000, 'Deliciosa torta de chocolate', 'peso'),
('Torta de Vainilla', 45000, 'Clásica torta de vainilla', 'peso'),
('Torta de Fresa', 48000, 'Fresca torta de fresa', 'peso'),
('Torta de Arequipe', 52000, 'Torta con arequipe', 'peso'),
('Cupcake de Chocolate', 8000, 'Cupcake individual de chocolate', 'tamano'),
('Cupcake de Vainilla', 7000, 'Cupcake individual de vainilla', 'tamano'),
('Cupcake de Fresa', 7500, 'Cupcake individual de fresa', 'tamano');

-- 5. Verificar productos insertados
SELECT * FROM productos ORDER BY nombre;

-- 6. Asegurarse de que hay sabores
INSERT INTO sabores (nombre) VALUES
('Chocolate'), ('Vainilla'), ('Fresa'), ('Arequipe'), ('Limon'), ('Mora')
ON CONFLICT (nombre) DO NOTHING;

-- 7. Asegurarse de que hay tamaños
INSERT INTO tamanos (nombre, tipo) VALUES
('1 libra', 'peso'),
('2 libras', 'peso'),
('3 libras', 'peso'),
('4 libras', 'peso'),
('Pequeño', 'tamano'),
('Mediano', 'tamano'),
('Grande', 'tamano')
ON CONFLICT (nombre, tipo) DO NOTHING;

-- 8. Verificar datos finales
SELECT 
  'Productos' as tabla, COUNT(*) as total 
FROM productos
UNION ALL
SELECT 'Sabores', COUNT(*) FROM sabores
UNION ALL  
SELECT 'Tamaños', COUNT(*) FROM tamanos;
