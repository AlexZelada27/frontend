import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/Cliente';

  clientes: Cliente[] = [];
  filtroNombre = '';
  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: Cliente = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): Cliente {
    return { nombre: '', telefono: '', correo: '' };
  }

  get clientesFiltrados(): Cliente[] {
    const q = this.filtroNombre.trim().toLowerCase();
    if (!q) return this.clientes;
    return this.clientes.filter((c) => (c.nombre || '').toLowerCase().includes(q));
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<Cliente[]>(this.apiUrl));
      this.clientes = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los clientes.';
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
    const telefonoLimpio = (this.form.telefono || '').trim();
    const correoLimpio = (this.form.correo || '').trim();

    if (!nombreLimpio || !telefonoLimpio || !correoLimpio) {
      this.error = 'Completa nombre, teléfono y correo antes de actualizar.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: Cliente = {
      idCliente: Number(this.editandoId),
      nombre: nombreLimpio,
      telefono: telefonoLimpio,
      correo: correoLimpio
    };

    try {
      await firstValueFrom(this.http.put<Cliente>(`${this.apiUrl}/${this.editandoId}`, payload));
      this.mensaje = 'Cliente actualizado correctamente.';
      this.limpiar();
      await this.listar();
    } catch {
      this.error = 'Error al actualizar cliente.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(c: Cliente): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = c.idCliente ?? null;
    this.form = {
      idCliente: c.idCliente,
      nombre: c.nombre ?? '',
      telefono: c.telefono ?? '',
      correo: c.correo ?? ''
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
      this.mensaje = 'Cliente eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar cliente (verifica si tiene reservas asociadas).';
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