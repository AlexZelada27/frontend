import { TipoServicio } from './tipo-servicio';

export interface Servicio {
  idServicio?: number;
  idTipoServicio?: number;
  nombre: string;
  precio: number;
  tipoServicio?: TipoServicio;
}