-- Script para depurar relaciones entre productos, sabores y tamaños
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar productos
SELECT 'PRODUCTOS' as tabla, id, nombre, descripcion FROM productos ORDER BY nombre;

-- 2. Verificar sabores
SELECT 'SABORES' as tabla, id, nombre FROM sabores ORDER BY nombre;

-- 3. Verificar tamaños
SELECT 'TAMAÑOS' as tabla, id, nombre, tipo FROM tamanos ORDER BY tipo, nombre;

-- 4. Verificar relaciones productos-sabores
SELECT 
  'PRODUCTOS_SABORES' as tabla,
  ps.producto_id,
  p.nombre as producto_nombre,
  ps.sabor_id,
  s.nombre as sabor_nombre
FROM productos_sabores ps
JOIN productos p ON ps.producto_id = p.id
JOIN sabores s ON ps.sabor_id = s.id
ORDER BY p.nombre, s.nombre;

-- 5. Verificar relaciones productos-tamaños
SELECT 
  'PRODUCTOS_TAMAÑOS' as tabla,
  pt.producto_id,
  p.nombre as producto_nombre,
  pt.tamano_id,
  t.nombre as tamano_nombre,
  t.tipo as tamano_tipo
FROM productos_tamanos pt
JOIN productos p ON pt.producto_id = p.id
JOIN tamanos t ON pt.tamano_id = t.id
ORDER BY p.nombre, t.tipo, t.nombre;

-- 6. Verificar si hay productos sin relaciones
SELECT 
  'PRODUCTOS_SIN_SABORES' as info,
  p.id,
  p.nombre
FROM productos p
LEFT JOIN productos_sabores ps ON p.id = ps.producto_id
WHERE ps.producto_id IS NULL;

SELECT 
  'PRODUCTOS_SIN_TAMAÑOS' as info,
  p.id,
  p.nombre
FROM productos p
LEFT JOIN productos_tamanos pt ON p.id = pt.producto_id
WHERE pt.producto_id IS NULL;

-- 7. Contar relaciones por producto
SELECT 
  p.nombre,
  COUNT(DISTINCT ps.sabor_id) as cantidad_sabores,
  COUNT(DISTINCT pt.tamano_id) as cantidad_tamanos
FROM productos p
LEFT JOIN productos_sabores ps ON p.id = ps.producto_id
LEFT JOIN productos_tamanos pt ON p.id = pt.producto_id
GROUP BY p.id, p.nombre
ORDER BY p.nombre;
