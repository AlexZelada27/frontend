export interface ReservaCreate {
  idCliente: number;
  idEmpleado: number;
  idHorarioFijo: number;
  idSala: number;
  estado: string;
  fechaReserva: string;
  idsServicios: number[];
  metodoPago: string;
}