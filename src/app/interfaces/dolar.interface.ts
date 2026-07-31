export interface Dolar {
  id: string;
  tipoOperacion: 'compra' | 'venta';
  tipoDolar: string;
  montoUSD: number;
  totalPesos: number;
  confirmado: boolean;
  usuarioId: string;
  usuarioNombre: string;
  cancelado?: boolean;           // Opcional: true si la operación fue cancelada
  confirmadoPor?: string;        // Opcional: email o id de quien confirmó
  confirmadoNombre?: string;     // Opcional: nombre de quien confirmó
}

