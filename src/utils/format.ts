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

// Obtener color de fondo según estado del pedido
export const getEstadoBackgroundColor = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return '#FFF8DC'; // Naranja muy claro
    case 'entregado':
      return '#F0FFF0'; // Verde muy claro
    case 'cancelado':
      return '#FFE4E1'; // Rojo muy claro
    default:
      return '#F5F5F5'; // Gris claro
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

// Generar ID único temporal (mientras no tengamos UUID del backend)
export const generateTempId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validar email
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

// Truncar texto
export const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength) + '...';
};

// Formatear descripción del producto según tipo y cantidad/peso
export const formatProductoDescripcion = (
  tipo: string,
  cantidad: number,
  label?: string
): string => {
  switch (tipo) {
    case 'torta':
      return `${label || `${cantidad} libra${cantidad !== 1 ? 's' : ''}`}`;
    case 'cupcake':
      return `${cantidad} unidad${cantidad !== 1 ? 'es' : ''}`;
    case 'combo':
      return label || `Combo para ${cantidad} personas`;
    case 'galletas':
      return `${cantidad} unidad${cantidad !== 1 ? 'es' : ''}`;
    case 'postres':
      return `${cantidad} unidad${cantidad !== 1 ? 'es' : ''}`;
    default:
      return `${cantidad} unidad${cantidad !== 1 ? 'es' : ''}`;
  }
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
