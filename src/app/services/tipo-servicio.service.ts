import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoServicio } from '../models/tipo-servicio';

export class TipoServicioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/TipoServicio';

  getAll(): Observable<TipoServicio[]> {
    return this.http.get<TipoServicio[]>(this.url);
  }

  getById(id: number): Observable<TipoServicio> {
    return this.http.get<TipoServicio>(`${this.url}/${id}`);
  }

  create(data: TipoServicio): Observable<TipoServicio> {
    return this.http.post<TipoServicio>(this.url, data);
  }

  update(id: number, data: TipoServicio): Observable<TipoServicio> {
    return this.http.put<TipoServicio>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}