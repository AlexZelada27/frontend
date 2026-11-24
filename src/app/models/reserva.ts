import { Cliente } from './cliente';
import { Empleado } from './empleado';
import { HorarioFijo } from './horarioFijo';
import { SalaEstudio } from './sala-estudio';

export interface Reserva {
  idReserva?: number;
  idCliente?: number;
  idEmpleado?: number;
  idHorarioFijo?: number;
  idSala?: number;
  estado: string;
  fechaReserva: string; // 'YYYY-MM-DD'
  metodoPago?: string;
  total?: number;
  cliente?: Cliente;
  empleado?: Empleado;
  horarioFijo?: HorarioFijo;
  salaEstudio?: SalaEstudio;
}