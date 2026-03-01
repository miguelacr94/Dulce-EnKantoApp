// Formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Formatear fecha
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

// Formatear fecha y hora
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Extraer solo la hora de una fecha
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Obtener color según estado del pedido
export const getEstadoColor = (estado: string): string => {
  if (!estado) return '#999'; // Gris por defecto
  
  switch (estado) {
    case 'pendiente':
      return '#FFA500'; // Naranja
    case 'entregado':
      return '#32CD32'; // Verde
    case 'cancelado':
      return '#FF6B6B'; // Rojo
    default:
      return '#999'; // Gris
  }
};

// Validar teléfono colombiano
export const validarTelefono = (telefono: string): boolean => {
  const telefonoRegex = /^3\d{9}$/;
  return telefonoRegex.test(telefono.replace(/\s/g, ''));
};

// Formatear teléfono
export const formatTelefono = (telefono: string): string => {
  const cleaned = telefono.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return telefono;
};

// Calcular días restantes hasta la fecha de entrega
export const diasHastaEntrega = (fechaEntrega: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const entrega = new Date(fechaEntrega);
  entrega.setHours(0, 0, 0, 0);
  
  const diffTime = entrega.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Calcular horas de atraso (solo para pedidos vencidos) - ajustado a zona horaria local
export const horasDeAtraso = (fechaEntrega: string): number => {
  const now = new Date();
  const entrega = new Date(fechaEntrega);
  
  // La fecha de entrega viene en UTC, pero new Date() la convierte automáticamente a local
  // No necesitamos conversión manual, JavaScript ya maneja la zona horaria
  
  console.log(`Hora actual local: ${now.toISOString()}`);
  console.log(`Fecha entrega UTC: ${entrega.toISOString()}`);
  console.log(`Fecha entrega interpretada como local: ${new Date(fechaEntrega).toISOString()}`);
  
  // Si no está vencido, retornar 0
  if (entrega >= now) return 0;
  
  const diffMs = now.getTime() - entrega.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  console.log(`Diferencia en horas: ${diffHours}`);
  
  return diffHours;
};

// Obtener texto de horas de atraso
export const getTextoHorasAtraso = (fechaEntrega: string): string => {
  const horas = horasDeAtraso(fechaEntrega);
  
  if (horas === 0) return '';
  
  if (horas < 24) {
    return `RETRASO ${horas} hora${horas !== 1 ? 's' : ''}`;
  } else {
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (horasRestantes === 0) {
      return `RETRASO ${dias} día${dias !== 1 ? 's' : ''}`;
    } else {
      return `RETRASO ${dias} día${dias !== 1 ? 's' : ''} y ${horasRestantes}h`;
    }
  }
};

// Verificar si un pedido está vencido - ajustado a zona horaria local
export const estaVencido = (fechaEntrega: string): boolean => {
  const now = new Date();
  const entrega = new Date(fechaEntrega);
  
  // JavaScript convierte automáticamente UTC a local
  return entrega < now;
};

// Convertir fecha UTC a hora local formateada
export const getHoraLocal = (fechaUTC: string): string => {
  const fecha = new Date(fechaUTC);
  
  // JavaScript ya convierte UTC a local automáticamente
  return fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Obtener texto de días restantes
export const getTextoDiasRestantes = (fechaEntrega: string): string => {
  const dias = diasHastaEntrega(fechaEntrega);
  
  if (dias < 0) {
    return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  } else if (dias === 0) {
    return 'Entrega hoy';
  } else if (dias === 1) {
    return 'Entrega mañana';
  } else if (dias <= 7) {
    return `Entrega en ${dias} días`;
  } else {
    return `Entrega en ${dias} días`;
  }
};

// Formatear fecha para base de datos (YYYY-MM-DD)
export const formatDateForDB = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];
  return dateObj.toISOString().split('T')[0];
};

// Formatear fecha y hora para base de datos (ISO string completo)
export const formatDateTimeForDB = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return new Date().toISOString();
  return dateObj.toISOString();
};

// Obtener etiqueta de peso/cantidad según tipo de producto
export const getProductoLabel = (tipo: string, peso: number | string, cantidad?: number): string => {
  switch (tipo) {
    case 'torta':
      if (peso === 0.25) return '1/4 libra';
      if (peso === 0.5) return '1/2 libra';
      return `${peso} libra${peso !== 1 ? 's' : ''}`;
    case 'cupcake':
      return `${cantidad || 0} unidad${cantidad !== 1 ? 'es' : ''}`;
    case 'combo':
      return `${cantidad || 0} unidad${cantidad !== 1 ? 'es' : ''}`;
    case 'galletas':
      return `${cantidad || 0} unidad${cantidad !== 1 ? 'es' : ''}`;
    case 'postres':
      return `${cantidad || 0} unidad${cantidad !== 1 ? 'es' : ''}`;
    default:
      return `${cantidad || 0} unidad${cantidad !== 1 ? 'es' : ''}`;
  }
};

// Formatear items del pedido para mostrar en tarjetas
export const formatPedidoItems = (pedido: any): string => {
  // Si el pedido tiene items (nueva estructura), usarlos
  if (pedido.items && pedido.items.length > 0) {
    return pedido.items.map((item: any) => {
      const productoNombre = item.producto?.nombre || 'Producto';
      const cantidad = item.cantidad || 1;
      const tamanoNombre = item.tamano?.nombre || '';
      const saborNombre = item.sabor?.nombre || '';
      
      let descripcion = `${cantidad}x ${productoNombre}`;
      if (tamanoNombre) descripcion += ` (${tamanoNombre})`;
      if (saborNombre) descripcion += ` - ${saborNombre}`;
      
      return descripcion;
    }).join(', ');
  }
  
  // Si no tiene items (estructura legacy), formatear con los campos disponibles
  const tipo = pedido.tipo_producto || 'producto';
  const cantidad = pedido.cantidad || 1;
  const sabor = pedido.sabor || '';
  const descripcion = pedido.descripcion || '';
  
  let resultado = `${cantidad}x ${tipo}`;
  if (sabor) resultado += ` - ${sabor}`;
  if (descripcion && descripcion.trim()) resultado += ` (${descripcion.trim()})`;
  
  return resultado;
};
