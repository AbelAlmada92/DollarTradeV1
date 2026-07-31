import { Dolar } from './dolar.interface';

export interface Operacion {
  id: number;
  tipo: 'compra' | 'venta';
  montoPesos: number;
  montoDolares: number;
  cotizacion: Dolar;
  fecha: string;
  confirmado: boolean;
}
