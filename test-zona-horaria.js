// Script para probar cálculo de zona horaria
// Copia y ejecuta en la consola del navegador o Node.js

const fechaEntregaUTC = "2026-03-01T16:34:00.000Z";
const ahora = new Date();
const entrega = new Date(fechaEntregaUTC);

console.log("=== ANÁLISIS DE ZONA HORARIA ===");
console.log("Fecha entrega UTC:", fechaEntregaUTC);
console.log("Hora actual:", ahora.toISOString());
console.log("");

console.log("=== CONVERSIÓN AUTOMÁTICA DE JAVASCRIPT ===");
console.log("Fecha entrega (new Date):", entrega.toString());
console.log("Fecha entrega (toISOString):", entrega.toISOString());
console.log("Fecha entrega (toLocaleString):", entrega.toLocaleString());
console.log("Fecha entrega (toLocaleTimeString):", entrega.toLocaleTimeString());
console.log("");

// Calcular diferencia
const diffMs = ahora.getTime() - entrega.getTime();
const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
const diffMinutes = Math.floor(diffMs / (1000 * 60));

console.log("=== CÁLCULO DE DIFERENCIA ===");
console.log("Diferencia en milisegundos:", diffMs);
console.log("Diferencia en minutos:", diffMinutes);
console.log("Diferencia en horas:", diffHours);
console.log("");

// Verificar si está vencido
const estaVencido = entrega < ahora;
console.log("=== ESTADO ===");
console.log("¿Está vencido?:", estaVencido);
console.log("¿Entrega >= Actual?:", entrega >= ahora);

if (estaVencido) {
  console.log("HORAS DE ATRASO:", diffHours);
  
  if (diffHours < 24) {
    console.log(`TEXTO: ${diffHours} hora${diffHours !== 1 ? 's' : ''} de atraso`);
  } else {
    const dias = Math.floor(diffHours / 24);
    const horasRestantes = diffHours % 24;
    if (horasRestantes === 0) {
      console.log(`TEXTO: ${dias} día${dias !== 1 ? 's' : ''} de atraso`);
    } else {
      console.log(`TEXTO: ${dias} día${dias !== 1 ? 's' : ''} y ${horasRestantes} hora${horasRestantes !== 1 ? 's' : ''} de atraso`);
    }
  }
} else {
  console.log("TEXTO: A tiempo");
}

console.log("");
console.log("=== INFORMACIÓN DE ZONA HORARIA ===");
console.log("Timezone offset (minutos):", ahora.getTimezoneOffset());
console.log("Timezone offset (horas):", ahora.getTimezoneOffset() / 60);
console.log("UTC actual:", ahora.toUTCString());
