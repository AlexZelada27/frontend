export interface ReservaCreate {
  idCliente: number;
  idEmpleado: number;
  idHorarioFijo: number;
  idSala: number;
  estado: string;
  fechaReserva: string; // LocalDate en formato 'YYYY-MM-DD'
  metodoPago: string;
  idsServicios: number[];
}