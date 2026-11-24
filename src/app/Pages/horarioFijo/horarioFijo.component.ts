import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { HorarioFijo } from '../../models/horarioFijo';

@Component({
  selector: 'app-horario-fijo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './horarioFijo.component.html',
  styleUrl: './horarioFijo.component.css'
})
export class HorarioFijoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/HorarioFijo';

  horarios: HorarioFijo[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: HorarioFijo = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): HorarioFijo {
    return {
      horario: '',
      horaFin: ''
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<HorarioFijo[]>(this.apiUrl).subscribe({
      next: (data) => (this.horarios = data),
      error: () => (this.error = 'No se pudieron cargar los horarios fijos.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<HorarioFijo>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Horario fijo actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar el horario fijo.')
      });
    } else {
      this.http.post<HorarioFijo>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Horario fijo registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar el horario fijo.')
      });
    }
  }

  editar(h: HorarioFijo): void {
    this.editandoId = h.idHorarioFijo ?? null;
    this.form = { ...h };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Horario fijo eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar el horario fijo.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}