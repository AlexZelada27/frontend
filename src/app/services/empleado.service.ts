import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from '../models/empleado';

export class EmpleadoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/Empleado';

  getAll(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }

  getById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.url}/${id}`);
  }

  create(data: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.url, data);
  }

  update(id: number, data: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}