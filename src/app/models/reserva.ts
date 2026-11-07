import { Cliente } from './cliente';
import { Empleado } from './empleado';
import { HorarioFijo } from './horarioFijo';
import { Pago } from './pago';
import { SalaEstudio } from './sala-estudio';
import { ReservaServicio } from './servicio'; // O './Servicio' según esté nombrado

export interface Reserva {
  idReserva: number;
  cliente: Cliente;
  empleado: Empleado;
  horarioFijo: HorarioFijo;
  pago: Pago;
  sala: SalaEstudio;
  estado: string;
  fechaReserva: string;
  servicios: ReservaServicio[];
}