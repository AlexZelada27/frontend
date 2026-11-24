export interface BloqueoFecha {
  idBloqueo?: number;
  fecha: string; // LocalDate en formato 'YYYY-MM-DD'
  idHorarioFijo?: number | null;
  motivo: string;
}