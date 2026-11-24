import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloqueoFecha } from '../models/bloqueo-fecha';

export class BloqueoFechaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/bloqueos';

  getAll(): Observable<BloqueoFecha[]> {
    return this.http.get<BloqueoFecha[]>(this.url);
  }

  getById(id: number): Observable<BloqueoFecha> {
    return this.http.get<BloqueoFecha>(`${this.url}/${id}`);
  }

  create(data: BloqueoFecha): Observable<BloqueoFecha> {
    return this.http.post<BloqueoFecha>(this.url, data);
  }

  update(id: number, data: BloqueoFecha): Observable<BloqueoFecha> {
    return this.http.put<BloqueoFecha>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}