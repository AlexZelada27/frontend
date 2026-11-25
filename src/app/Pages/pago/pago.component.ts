import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Pago } from '../../models/pago';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private readonly baseUrl = 'http://localhost:8080/v1';
  private readonly apiUrl = `${this.baseUrl}/Pago`;

  pagos: any[] = [];
  reservas: any[] = [];
  fechaPorPagoMap: Record<number, string> = {};
  fechaPorReservaMap: Record<number, string> = {};

  filtroFecha = '';
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargarTodo();
  }

  private normalizarFecha(valor: any): string {
    if (!valor) return '';
    const str = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.slice(0, 10);
    }
    return str;
  }

  async cargarTodo(): Promise<void> {
    this.error = '';
    try {
      await Promise.all([
        this.cargarReservas().catch(() => {}),
        this.listar().catch(() => {})
      ]);
      this.construirMapasFechas();
      this.pagos = [...this.pagos];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los pagos.';
      this.cdr.detectChanges();
    }
  }

  async cargarReservas(): Promise<void> {
    const data = await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/Reserva`));
    this.reservas = Array.isArray(data) ? data : [];
  }

  async listar(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Pago[]>(this.apiUrl));
      this.pagos = Array.isArray(data) ? [...data] : [];
      this.construirMapasFechas();
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los pagos.';
      this.cdr.detectChanges();
    }
  }

  construirMapasFechas(): void {
    this.fechaPorPagoMap = {};
    this.fechaPorReservaMap = {};

    for (const r of this.reservas) {
      const fechaReserva = this.normalizarFecha(r?.fechaReserva ?? r?.fecha_reserva);
      if (!fechaReserva) continue;

      const idReserva = r?.idReserva ?? r?.id_reserva;
      if (idReserva != null) {
        this.fechaPorReservaMap[Number(idReserva)] = fechaReserva;
      }

      const idPago = r?.idPago ?? r?.id_pago ?? r?.pago?.idPago ?? r?.pago?.id_pago;
      if (idPago != null) {
        this.fechaPorPagoMap[Number(idPago)] = fechaReserva;
      }
    }
  }

  obtenerFechaPago(p: any): string {
    const directa = this.normalizarFecha(
      p?.fechaPago ??
        p?.fecha_pago ??
        p?.fechaReserva ??
        p?.fecha_reserva ??
        p?.fecha ??
        p?.reserva?.fechaReserva ??
        p?.reserva?.fecha_reserva
    );
    if (directa) return directa;

    const idPago = Number(p?.idPago ?? p?.id_pago);
    if (!isNaN(idPago) && this.fechaPorPagoMap[idPago]) {
      return this.fechaPorPagoMap[idPago];
    }

    const idReserva = Number(p?.idReserva ?? p?.id_reserva ?? p?.reserva?.idReserva ?? p?.reserva?.id_reserva);
    if (!isNaN(idReserva) && this.fechaPorReservaMap[idReserva]) {
      return this.fechaPorReservaMap[idReserva];
    }

    return '-';
  }

  get pagosFiltrados(): any[] {
    const fechaBuscada = this.normalizarFecha(this.filtroFecha);
    if (!fechaBuscada) return this.pagos;

    return this.pagos.filter((p) => this.obtenerFechaPago(p) === fechaBuscada);
  }

  calcularTotalFiltrado(): number {
    return this.pagosFiltrados.reduce((acc, p) => {
      const monto = Number(p?.monto ?? 0);
      return acc + (isNaN(monto) ? 0 : monto);
    }, 0);
  }
}