import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/Empleado';

  empleados: Empleado[] = [];
  filtroNombre = '';
  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: Empleado = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Empleado {
    return { nombre: '', cargo: '', correo: '' };
  }

  get empleadosFiltrados(): Empleado[] {
    const q = this.filtroNombre.trim().toLowerCase();
    if (!q) return this.empleados;
    return this.empleados.filter((e) => (e.nombre || '').toLowerCase().includes(q));
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<Empleado[]>(this.apiUrl));
      this.empleados = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los empleados.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    if (this.editandoId === null) {
      return;
    }

    const nombreLimpio = (this.form.nombre || '').trim();
    const cargoLimpio = (this.form.cargo || '').trim();
    const correoLimpio = (this.form.correo || '').trim();

    if (!nombreLimpio || !cargoLimpio || !correoLimpio) {
      this.error = 'Completa nombre, cargo y correo antes de actualizar.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: Empleado = {
      idEmpleado: Number(this.editandoId),
      nombre: nombreLimpio,
      cargo: cargoLimpio,
      correo: correoLimpio
    };

    try {
      await firstValueFrom(this.http.put<Empleado>(`${this.apiUrl}/${this.editandoId}`, payload));
      this.mensaje = 'Empleado actualizado correctamente.';
      this.limpiar();
      await this.listar();
    } catch {
      this.error = 'Error al actualizar empleado.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(e: Empleado): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = e.idEmpleado ?? null;
    this.form = {
      idEmpleado: e.idEmpleado,
      nombre: e.nombre ?? '',
      cargo: e.cargo ?? '',
      correo: e.correo ?? ''
    };
    this.cdr.detectChanges();
  }

  async eliminar(id: number): Promise<void> {
    this.mensaje = '';
    this.error = '';
    this.guardando = true;
    this.cdr.detectChanges();

    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
      if (this.editandoId !== null && Number(this.editandoId) === Number(id)) {
        this.limpiar();
      }
      this.mensaje = 'Empleado eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar empleado (verifica si tiene reservas o registros asociados).';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }
}