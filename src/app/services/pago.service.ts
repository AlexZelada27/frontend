import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago';

export class PagoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Pago';

  getAll(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url);
  }

  getById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.url}/${id}`);
  }

  create(data: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.url, data);
  }

  update(id: number, data: Pago): Observable<Pago> {
    return this.http.put<Pago>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}