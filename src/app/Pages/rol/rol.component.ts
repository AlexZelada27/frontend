import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/Rol';

  roles: Rol[] = [];
  editandoId: number | null = null;
  guardando = false;
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

  obtenerIdRol(r: any): number | null {
    const id = r?.idRol ?? r?.id_rol ?? r?.id ?? null;
    if (id == null) return null;
    const num = Number(id);
    return isNaN(num) ? null : num;
  }

  estaActivo(r: any): boolean {
    const val = r?.estado;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.trim().toUpperCase() === 'ACTIVO' || val.trim().toLowerCase() === 'true';
    return Boolean(val);
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<Rol[]>(this.apiUrl));
      this.roles = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los roles.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const nombreLimpio = (this.form.nombre || '').trim();
    const descripcionLimpia = (this.form.descripcion || '').trim();

    if (!nombreLimpio || !descripcionLimpia) {
      this.error = 'Completa el nombre y la descripción del rol.';
      this.cdr.detectChanges();
      return;
    }

    const activo = Boolean(this.form.estado);
    const payload: any = {
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      estado: activo
    };

    if (this.editandoId !== null) {
      payload.idRol = Number(this.editandoId);
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      if (this.editandoId !== null) {
        await firstValueFrom(this.http.put<Rol>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Rol actualizado correctamente.';
      } else {
        await firstValueFrom(this.http.post<Rol>(this.apiUrl, payload));
        this.mensaje = 'Rol registrado correctamente.';
      }
      this.limpiar();
      await this.listar();
    } catch {
      this.error =
        this.editandoId !== null
          ? 'Error al actualizar el rol.'
          : 'Error al registrar el rol.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(r: Rol): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = this.obtenerIdRol(r);
    this.form = {
      idRol: this.obtenerIdRol(r) ?? undefined,
      nombre: r.nombre ?? '',
      descripcion: r.descripcion ?? '',
      estado: this.estaActivo(r)
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
      this.mensaje = 'Rol eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar el rol (verifica si está asignado a usuarios).';
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