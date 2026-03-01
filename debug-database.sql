-- Script para depurar y solucionar problemas de base de datos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si las tablas existen
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar estructura de la tabla productos
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 3. Verificar si hay datos en productos
SELECT COUNT(*) as total_productos FROM productos;

-- 4. Verificar datos existentes
SELECT * FROM productos ORDER BY nombre LIMIT 10;

-- 5. Verificar si hay datos en sabores
SELECT COUNT(*) as total_sabores FROM sabores;
SELECT * FROM sabores ORDER BY nombre LIMIT 10;

-- 6. Verificar si hay datos en tamanos
SELECT COUNT(*) as total_tamanos FROM tamanos;
SELECT * FROM tamanos ORDER BY nombre, tipo LIMIT 10;

-- 7. Insertar datos de ejemplo si no existen (versión corregida)
INSERT INTO productos (nombre, tipo_producto, precio, descripcion, tipo_medida) 
SELECT 
    'Torta de Chocolate', 'torta', 50000, 'Deliciosa torta de chocolate', 'peso'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Torta de Chocolate');

INSERT INTO productos (nombre, tipo_producto, precio, descripcion, tipo_medida) 
SELECT 
    'Torta de Vainilla', 'torta', 45000, 'Clásica torta de vainilla', 'peso'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Torta de Vainilla');

INSERT INTO productos (nombre, tipo_producto, precio, descripcion, tipo_medida) 
SELECT 
    'Cupcake de Chocolate', 'cupcake', 8000, 'Cupcake individual de chocolate', 'tamano'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Cupcake de Chocolate');

-- 8. Insertar sabores si no existen
INSERT INTO sabores (nombre) 
SELECT 'Chocolate' 
WHERE NOT EXISTS (SELECT 1 FROM sabores WHERE nombre = 'Chocolate');

INSERT INTO sabores (nombre) 
SELECT 'Vainilla' 
WHERE NOT EXISTS (SELECT 1 FROM sabores WHERE nombre = 'Vainilla');

INSERT INTO sabores (nombre) 
SELECT 'Fresa' 
WHERE NOT EXISTS (SELECT 1 FROM sabores WHERE nombre = 'Fresa');

-- 9. Insertar tamaños si no existen
INSERT INTO tamanos (nombre, tipo) 
SELECT '1 libra', 'peso'
WHERE NOT EXISTS (SELECT 1 FROM tamanos WHERE nombre = '1 libra' AND tipo = 'peso');

INSERT INTO tamanos (nombre, tipo) 
SELECT '2 libras', 'peso'
WHERE NOT EXISTS (SELECT 1 FROM tamanos WHERE nombre = '2 libras' AND tipo = 'peso');

INSERT INTO tamanos (nombre, tipo) 
SELECT 'Pequeño', 'tamano'
WHERE NOT EXISTS (SELECT 1 FROM tamanos WHERE nombre = 'Pequeño' AND tipo = 'tamano');

INSERT INTO tamanos (nombre, tipo) 
SELECT 'Mediano', 'tamano'
WHERE NOT EXISTS (SELECT 1 FROM tamanos WHERE nombre = 'Mediano' AND tipo = 'tamano');

-- 10. Verificar resultados finales
SELECT 'Productos' as table_name, COUNT(*) as count FROM productos
UNION ALL
SELECT 'Sabores', COUNT(*) FROM sabores  
UNION ALL
SELECT 'Tamaños', COUNT(*) FROM tamanos;
