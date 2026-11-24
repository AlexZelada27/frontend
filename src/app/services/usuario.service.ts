import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

export class UsuarioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Usuario';

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  create(data: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, data);
  }

  update(id: number, data: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}