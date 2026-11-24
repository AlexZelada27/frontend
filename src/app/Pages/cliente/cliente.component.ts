import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Cliente';

  clientes: Cliente[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Cliente = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Cliente {
    return { nombre: '', telefono: '', correo: '' };
  }

  listar(): void {
    this.error = '';
    this.http.get<Cliente[]>(this.apiUrl).subscribe({
      next: (data) => (this.clientes = data),
      error: () => (this.error = 'No se pudieron cargar los clientes.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Cliente>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Cliente actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar cliente.')
      });
    } else {
      this.http.post<Cliente>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Cliente registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar cliente.')
      });
    }
  }

  editar(c: Cliente): void {
    this.editandoId = c.idCliente ?? null;
    this.form = { ...c };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Cliente eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar cliente.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}