import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva';
import { ReservaCreate } from '../models/reserva-create';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Reserva';

  getAll(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url);
  }

  getById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.url}/${id}`);
  }

  create(data: ReservaCreate): Observable<string> {
    return this.http.post(this.url, data, { responseType: 'text' });
  }

  update(id: number, data: ReservaCreate): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
} 