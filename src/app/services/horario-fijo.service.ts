import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioFijo } from '../models/horarioFijo';

export class HorarioFijoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/HorarioFijo';

  getAll(): Observable<HorarioFijo[]> {
    return this.http.get<HorarioFijo[]>(this.url);
  }

  getById(id: number): Observable<HorarioFijo> {
    return this.http.get<HorarioFijo>(`${this.url}/${id}`);
  }

  create(data: HorarioFijo): Observable<HorarioFijo> {
    return this.http.post<HorarioFijo>(this.url, data);
  }

  update(id: number, data: HorarioFijo): Observable<HorarioFijo> {
    return this.http.put<HorarioFijo>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}