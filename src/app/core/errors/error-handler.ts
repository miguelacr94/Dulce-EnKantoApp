import { AppError } from './index';

export const errorHandler = {
  handle(error: unknown): string {
    if (error instanceof AppError) {
      return this.getUserMessage(error);
    }

    if (error instanceof Error) {
      return error.message || 'Ha ocurrido un error inesperado';
    }

    return 'Ha ocurrido un error inesperado';
  },

  getUserMessage(error: AppError): string {
    const userMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Por favor verifica los datos ingresados',
      NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
      SUPABASE_ERROR: 'Error en el servidor. Intenta más tarde',
      FETCH_ERROR: 'Error al cargar los datos',
      CREATE_ERROR: 'Error al crear el registro',
      UPDATE_ERROR: 'Error al actualizar el registro',
      DELETE_ERROR: 'Error al eliminar el registro',
      NOT_FOUND: 'Registro no encontrado',
    };

    return userMessages[error.code] || error.message;
  },

  isNetworkError(error: unknown): boolean {
    return error instanceof AppError && error.code === 'NETWORK_ERROR';
  },

  isValidationError(error: unknown): boolean {
    return error instanceof AppError && error.code === 'VALIDATION_ERROR';
  },
};
