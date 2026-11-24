import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../models/servicio';

export class ServicioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Servicio';

  getAll(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.url);
  }

  getById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.url}/${id}`);
  }

  create(data: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.url, data);
  }

  update(id: number, data: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}