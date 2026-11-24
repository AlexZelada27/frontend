import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './servicio.component.html',
  styleUrl: './servicio.component.css'
})
export class ServicioComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Servicio';

  servicios: Servicio[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Servicio = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Servicio {
    return {
      idTipoServicio: 1,
      nombre: '',
      precio: 0
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<Servicio[]>(this.apiUrl).subscribe({
      next: (data) => (this.servicios = data),
      error: () => (this.error = 'No se pudieron cargar los servicios.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Servicio>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Servicio actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar servicio.')
      });
    } else {
      this.http.post<Servicio>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Servicio registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar servicio.')
      });
    }
  }

  editar(s: Servicio): void {
    this.editandoId = s.idServicio ?? null;
    this.form = {
      idServicio: s.idServicio,
      idTipoServicio: s.idTipoServicio ?? s.tipoServicio?.idTipoServicio ?? 1,
      nombre: s.nombre,
      precio: s.precio
    };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Servicio eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar servicio.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}