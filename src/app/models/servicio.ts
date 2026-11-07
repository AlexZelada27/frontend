export interface TipoServicio {
  idTipoServicio: number;
  nombre: string;
}

export interface Servicio {
  idServicio: number;
  tipoServicio: TipoServicio;
  nombre: string;
  precio: number;
}

export interface ReservaServicio {
  idReservaServicio: number;
  servicio: Servicio;
  precio: number;
}