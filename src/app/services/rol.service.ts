import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';

export class RolService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Rol';

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.url);
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.url}/${id}`);
  }

  create(data: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.url, data);
  }

  update(id: number, data: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}