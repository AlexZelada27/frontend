import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SalaEstudio } from '../../models/sala-estudio';

@Component({
  selector: 'app-sala-estudio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sala-estudio.component.html',
  styleUrl: './sala-estudio.component.css'
})
export class SalaEstudioComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/SalaEstudio';

  salas: SalaEstudio[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: SalaEstudio = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): SalaEstudio {
    return { nombre: '', direccion: '', descripcion: '', capacidad: 1 };
  }

  listar(): void {
    this.error = '';
    this.http.get<SalaEstudio[]>(this.apiUrl).subscribe({
      next: (data) => (this.salas = data),
      error: () => (this.error = 'No se pudieron cargar las salas.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<SalaEstudio>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Sala actualizada.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar sala.')
      });
    } else {
      this.http.post<SalaEstudio>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Sala registrada.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar sala.')
      });
    }
  }

  editar(s: SalaEstudio): void {
    this.editandoId = s.idSala ?? null;
    this.form = { ...s };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Sala eliminada.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar sala.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}