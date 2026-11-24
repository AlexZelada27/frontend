import { Rol } from './rol';

export interface Usuario {
  idUsuario?: number;
  idRol?: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  password?: string;
  estado: string;
  rol?: Rol;
}