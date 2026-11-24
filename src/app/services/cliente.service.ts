import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';

export class ClienteService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Cliente';

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  create(data: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, data);
  }

  update(id: number, data: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}