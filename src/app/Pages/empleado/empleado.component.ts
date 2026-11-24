import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Empleado } from '../../models/empleado';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Empleado';

  empleados: Empleado[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Empleado = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Empleado {
    return { nombre: '', cargo: '', correo: '' };
  }

  listar(): void {
    this.error = '';
    this.http.get<Empleado[]>(this.apiUrl).subscribe({
      next: (data) => (this.empleados = data),
      error: () => (this.error = 'No se pudieron cargar los empleados.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId !== null) {
      this.http.put<Empleado>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Empleado actualizado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar empleado.')
      });
    } else {
      this.http.post<Empleado>(this.apiUrl, this.form).subscribe({
        next: () => {
          this.mensaje = 'Empleado registrado.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar empleado.')
      });
    }
  }

  editar(e: Empleado): void {
    this.editandoId = e.idEmpleado ?? null;
    this.form = { ...e };
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Empleado eliminado.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar empleado.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}