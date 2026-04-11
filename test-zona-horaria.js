// Script para probar cálculo de zona horaria
// Copia y ejecuta en la consola del navegador o Node.js

const fechaEntregaUTC = '2026-03-01T16:34:00.000Z';
const ahora = new Date();
const entrega = new Date(fechaEntregaUTC);

// Calcular diferencia
const diffMs = ahora.getTime() - entrega.getTime();
const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
const diffMinutes = Math.floor(diffMs / (1000 * 60));

// Verificar si está vencido
const estaVencido = entrega < ahora;

if (estaVencido) {
  if (diffHours < 24) {
  } else {
    const dias = Math.floor(diffHours / 24);
    const horasRestantes = diffHours % 24;
    if (horasRestantes === 0) {
    } else {
    }
  }
} else {
}
