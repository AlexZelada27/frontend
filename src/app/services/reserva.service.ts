import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva';
import { ReservaCreate } from '../models/reserva-create';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8080/v1/Reserva';

  constructor(private http: HttpClient) { }

  listarReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  guardarReserva(reserva: ReservaCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, reserva);
  }
}