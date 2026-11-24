import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Usuario';

  usuarios: Usuario[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Usuario = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Usuario {
    return {
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      password: '',
      idRol: undefined,
      estado: 'ACTIVO'
    };
  }

  listar(): void {
    this.error = '';
    this.http.get<Usuario[]>(this.apiUrl).subscribe({
      next: (data) => (this.usuarios = data),
      error: () => (this.error = 'No se pudieron cargar los usuarios.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Usuario>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Usuario actualizado correctamente.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar el usuario.')
      });
    } else {
      this.http.post<Usuario>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Usuario creado correctamente.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al crear el usuario.')
      });
    }
  }

  editar(u: Usuario): void {
    this.editandoId = u.idUsuario ?? null;
    this.form = { ...u, password: '' };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado.';
        this.listar();
      },
      error: () => (this.error = 'No se pudo eliminar el usuario.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}