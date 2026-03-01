-- Script para corregir la base de datos según el schema REAL
-- Ejecutar en el SQL Editor de Supabase

-- 1. Limpiar datos existentes
DELETE FROM productos;
DELETE FROM sabores;
DELETE FROM tamanos;

-- 2. Insertar productos (solo id, nombre, descripcion, created_at)
INSERT INTO productos (nombre, descripcion) VALUES
('Torta de Chocolate', 'Deliciosa torta de chocolate'),
('Torta de Vainilla', 'Clásica torta de vainilla'),
('Torta de Fresa', 'Fresca torta de fresa'),
('Torta de Arequipe', 'Torta con arequipe'),
('Torta de Limón', 'Torta cítrica de limón'),
('Cupcake de Chocolate', 'Cupcake individual de chocolate'),
('Cupcake de Vainilla', 'Cupcake individual de vainilla'),
('Cupcake de Fresa', 'Cupcake individual de fresa'),
('Cupcake de Arequipe', 'Cupcake con arequipe');

-- 3. Insertar sabores
INSERT INTO sabores (nombre, descripcion) VALUES
('Chocolate', 'Sabor chocolate intenso'),
('Vainilla', 'Sabor vainilla suave'),
('Fresa', 'Sabor fresa fresca'),
('Arequipe', 'Sabor arequipe dulce'),
('Limon', 'Sabor limón ácido'),
('Mora', 'Sabor mora silvestre'),
('Coco', 'Sabor coco tropical'),
('Naranja', 'Sabor naranja cítrica');

-- 4. Insertar tamaños (con tipo peso o tamano)
INSERT INTO tamanos (nombre, tipo) VALUES
('1 libra', 'peso'),
('2 libras', 'peso'),
('3 libras', 'peso'),
('4 libras', 'peso'),
('5 libras', 'peso'),
('Pequeño', 'tamano'),
('Mediano', 'tamano'),
('Grande', 'tamano'),
('Extra Grande', 'tamano');

-- 5. Asociar productos con sabores (muchos a muchos)
INSERT INTO productos_sabores (producto_id, sabor_id)
SELECT p.id, s.id 
FROM productos p, sabores s 
WHERE p.nombre LIKE '%Torta%' OR p.nombre LIKE '%Cupcake%'
ON CONFLICT DO NOTHING;

-- 6. Asociar productos con tamaños (muchos a muchos)
-- Tortas con pesos
INSERT INTO productos_tamanos (producto_id, tamano_id)
SELECT p.id, t.id 
FROM productos p, tamanos t 
WHERE p.nombre LIKE '%Torta%' AND t.tipo = 'peso'
ON CONFLICT DO NOTHING;

-- Cupcakes con tamaños
INSERT INTO productos_tamanos (producto_id, tamano_id)
SELECT p.id, t.id 
FROM productos p, tamanos t 
WHERE p.nombre LIKE '%Cupcake%' AND t.tipo = 'tamano'
ON CONFLICT DO NOTHING;

-- 7. Verificar datos insertados
SELECT 'Productos' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 'Sabores', COUNT(*) FROM sabores
UNION ALL
SELECT 'Tamaños', COUNT(*) FROM tamanos
UNION ALL
SELECT 'Productos-Sabores', COUNT(*) FROM productos_sabores
UNION ALL
SELECT 'Productos-Tamaños', COUNT(*) FROM productos_tamanos;

-- 8. Mostrar algunos datos de ejemplo
SELECT 'PRODUCTOS:' as info, nombre, descripcion FROM productos ORDER BY nombre LIMIT 5;
SELECT 'SABORES:' as info, nombre, descripcion FROM sabores ORDER BY nombre LIMIT 5;
SELECT 'TAMAÑOS:' as info, nombre, tipo FROM tamanos ORDER BY tipo, nombre LIMIT 5;
