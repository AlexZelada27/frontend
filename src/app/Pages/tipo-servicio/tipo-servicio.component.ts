import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TipoServicio } from '../../models/tipo-servicio';

@Component({
  selector: 'app-tipo-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tipo-servicio.component.html',
  styleUrl: './tipo-servicio.component.css'
})
export class TipoServicioComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/TipoServicio';

  tipos: TipoServicio[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: TipoServicio = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): TipoServicio {
    return {
      nombre: ''
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<TipoServicio[]>(this.apiUrl).subscribe({
      next: (data) => (this.tipos = data),
      error: () => (this.error = 'No se pudieron cargar los tipos de servicio.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<TipoServicio>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Tipo de servicio actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar tipo de servicio.')
      });
    } else {
      this.http.post<TipoServicio>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Tipo de servicio registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar tipo de servicio.')
      });
    }
  }

  editar(t: TipoServicio): void {
    this.editandoId = t.idTipoServicio ?? null;
    this.form = { ...t };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Tipo de servicio eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar tipo de servicio.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}