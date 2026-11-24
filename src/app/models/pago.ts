export interface Pago {
  idPago?: number;
  monto: number;
  metodoPago: string;
  fechaPago?: string;
  estado?: string;
  idReserva?: number;
}