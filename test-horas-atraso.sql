-- Script para probar pedidos con diferentes horas de atraso
-- Ejecutar en el SQL Editor de Supabase

-- 1. Insertar pedidos de prueba con diferentes fechas/horas de entrega

-- Pedido con 2 horas de atraso (fecha actual - 2 horas)
INSERT INTO pedidos (
  cliente_nombre, 
  cliente_telefono, 
  tipo_producto, 
  peso, 
  cantidad, 
  sabor, 
  descripcion, 
  precio_total, 
  estado, 
  fecha_entrega
) VALUES (
  'Cliente Test 2h', 
  '1234567890', 
  'torta', 
  3, 
  1, 
  'Chocolate', 
  'Torta de prueba 2 horas atraso', 
  150000, 
  'pendiente', 
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
);

-- Pedido con 5 horas de atraso
INSERT INTO pedidos (
  cliente_nombre, 
  cliente_telefono, 
  tipo_producto, 
  peso, 
  cantidad, 
  sabor, 
  descripcion, 
  precio_total, 
  estado, 
  fecha_entrega
) VALUES (
  'Cliente Test 5h', 
  '1234567891', 
  'cupcake', 
  1, 
  10, 
  'Vainilla', 
  'Cupcakes de prueba 5 horas atraso', 
  80000, 
  'pendiente', 
  CURRENT_TIMESTAMP - INTERVAL '5 hours'
);

-- Pedido con 1 día y 3 horas de atraso (27 horas)
INSERT INTO pedidos (
  cliente_nombre, 
  cliente_telefono, 
  tipo_producto, 
  peso, 
  cantidad, 
  sabor, 
  descripcion, 
  precio_total, 
  estado, 
  fecha_entrega
) VALUES (
  'Cliente Test 1d3h', 
  '1234567892', 
  'torta', 
  2, 
  1, 
  'Fresa', 
  'Torta de prueba 1 día 3 horas atraso', 
  120000, 
  'pendiente', 
  CURRENT_TIMESTAMP - INTERVAL '27 hours'
);

-- Pedido con 3 días de atraso (72 horas)
INSERT INTO pedidos (
  cliente_nombre, 
  cliente_telefono, 
  tipo_producto, 
  peso, 
  cantidad, 
  sabor, 
  descripcion, 
  precio_total, 
  estado, 
  fecha_entrega
) VALUES (
  'Cliente Test 3d', 
  '1234567893', 
  'torta', 
  4, 
  1, 
  'Arequipe', 
  'Torta de prueba 3 días atraso', 
  200000, 
  'pendiente', 
  CURRENT_TIMESTAMP - INTERVAL '3 days'
);

-- Pedido futuro (no debe mostrar atraso)
INSERT INTO pedidos (
  cliente_nombre, 
  cliente_telefono, 
  tipo_producto, 
  peso, 
  cantidad, 
  sabor, 
  descripcion, 
  precio_total, 
  estado, 
  fecha_entrega
) VALUES (
  'Cliente Test Futuro', 
  '1234567894', 
  'cupcake', 
  1, 
  5, 
  'Limon', 
  'Cupcakes futuros', 
  40000, 
  'pendiente', 
  CURRENT_TIMESTAMP + INTERVAL '2 days'
);

-- Verificar los pedidos insertados
SELECT 
  id,
  cliente_nombre,
  fecha_entrega,
  estado,
  CASE 
    WHEN fecha_entrega < CURRENT_TIMESTAMP THEN 
      'ATRASADO'
    ELSE 
      'A TIEMPO'
  END as estado_atraso,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fecha_entrega)) / 3600 as horas_atraso
FROM pedidos 
WHERE cliente_nombre LIKE 'Cliente Test%'
ORDER BY fecha_entrega DESC;
