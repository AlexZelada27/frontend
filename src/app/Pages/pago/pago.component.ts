import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
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
  private apiUrl = 'http://localhost:8080/v1/Pago';

  pagos: Pago[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Pago = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Pago {
    return {
      monto: 0,
      metodoPago: 'EFECTIVO'
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<Pago[]>(this.apiUrl).subscribe({
      next: (data) => (this.pagos = data),
      error: () => (this.error = 'No se pudieron cargar los pagos.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Pago>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Pago actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar pago.')
      });
    } else {
      this.http.post<Pago>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Pago registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar pago.')
      });
    }
  }

  editar(p: Pago): void {
    this.editandoId = p.idPago ?? null;
    this.form = { ...p };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Pago eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar pago.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}