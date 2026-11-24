import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Rol } from '../../models/rol';

@Component({
  selector: 'app-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.css'
})
export class RolComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Rol';

  roles: Rol[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Rol = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Rol {
    return {
      nombre: '',
      descripcion: '',
      estado: true
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<Rol[]>(this.apiUrl).subscribe({
      next: (data) => (this.roles = data),
      error: () => (this.error = 'No se pudieron cargar los roles.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Rol>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Rol actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar el rol.')
      });
    } else {
      this.http.post<Rol>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Rol registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar el rol.')
      });
    }
  }

  editar(r: Rol): void {
    this.editandoId = r.idRol ?? null;
    this.form = { ...r };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Rol eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar el rol.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}