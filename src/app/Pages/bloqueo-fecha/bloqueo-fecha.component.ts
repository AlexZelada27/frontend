import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BloqueoFecha } from '../../models/bloqueo-fecha';

@Component({
  selector: 'app-bloqueo-fecha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bloqueo-fecha.component.html',
  styleUrl: './bloqueo-fecha.component.css'
})
export class BloqueoFechaComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/bloqueos';

  bloqueos: BloqueoFecha[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: BloqueoFecha = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): BloqueoFecha {
    return {
      fecha: new Date().toISOString().slice(0, 10),
      idHorarioFijo: null,
      motivo: ''
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<BloqueoFecha[]>(this.apiUrl).subscribe({
      next: (data) => (this.bloqueos = data),
      error: () => (this.error = 'No se pudieron cargar los bloqueos de fecha.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    const payload: BloqueoFecha = {
      ...this.form,
      idHorarioFijo: this.form.idHorarioFijo ? Number(this.form.idHorarioFijo) : null
    };

    if (this.editandoId !== null) {
      this.http.put<BloqueoFecha>(`${this.apiUrl}/${this.editandoId}`, payload).subscribe({
        next: () => {
          this.mensaje = 'Bloqueo de fecha actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar el bloqueo.')
      });
    } else {
      this.http.post<BloqueoFecha>(this.apiUrl, payload).subscribe({
        next: () => {
          this.mensaje = 'Bloqueo de fecha registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar el bloqueo.')
      });
    }
  }

  editar(b: BloqueoFecha): void {
    this.editandoId = b.idBloqueo ?? null;
    this.form = {
      idBloqueo: b.idBloqueo,
      fecha: b.fecha,
      idHorarioFijo: b.idHorarioFijo ?? null,
      motivo: b.motivo
    };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Bloqueo eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar el bloqueo.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}