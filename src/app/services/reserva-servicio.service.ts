import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservaServicio } from '../models/reserva-servicio';

export class ReservaServicioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/ReservaServicio';

  getAll(): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(this.url);
  }

  getById(id: number): Observable<ReservaServicio> {
    return this.http.get<ReservaServicio>(`${this.url}/${id}`);
  }

  create(data: ReservaServicio): Observable<ReservaServicio> {
    return this.http.post<ReservaServicio>(this.url, data);
  }

  update(id: number, data: ReservaServicio): Observable<ReservaServicio> {
    return this.http.put<ReservaServicio>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}