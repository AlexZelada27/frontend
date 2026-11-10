import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = 'http://localhost:8080/v1/Pago';

  constructor(private http: HttpClient) { }

  listarPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }
}
