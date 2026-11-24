import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaEstudio } from '../models/sala-estudio';

export class SalaEstudioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/v1/SalaEstudio';

  getAll(): Observable<SalaEstudio[]> {
    return this.http.get<SalaEstudio[]>(this.url);
  }

  getById(id: number): Observable<SalaEstudio> {
    return this.http.get<SalaEstudio>(`${this.url}/${id}`);
  }

  create(data: SalaEstudio): Observable<SalaEstudio> {
    return this.http.post<SalaEstudio>(this.url, data);
  }

  update(id: number, data: SalaEstudio): Observable<SalaEstudio> {
    return this.http.put<SalaEstudio>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}