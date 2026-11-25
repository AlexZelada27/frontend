import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/TipoServicio';

  tipos: TipoServicio[] = [];
  editandoId: number | null = null;
  guardando = false;
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

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<TipoServicio[]>(this.apiUrl));
      this.tipos = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los tipos de servicio.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const nombreLimpio = (this.form.nombre || '').trim();
    if (!nombreLimpio) {
      this.error = 'Ingresa el nombre del tipo de servicio.';
      this.cdr.detectChanges();
      return;
    }

    const existeDuplicado = this.tipos.some((t) => {
      const mismoId = this.editandoId !== null && Number(t.idTipoServicio) === Number(this.editandoId);
      return !mismoId && (t.nombre || '').trim().toLowerCase() === nombreLimpio.toLowerCase();
    });

    if (existeDuplicado) {
      this.error = 'Ya existe un tipo de servicio con ese nombre.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: TipoServicio = {
      ...(this.editandoId !== null ? { idTipoServicio: Number(this.editandoId) } : {}),
      nombre: nombreLimpio
    };

    try {
      if (this.editandoId !== null) {
        await firstValueFrom(this.http.put<TipoServicio>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Tipo de servicio actualizado correctamente.';
      } else {
        await firstValueFrom(this.http.post<TipoServicio>(this.apiUrl, payload));
        this.mensaje = 'Tipo de servicio registrado correctamente.';
      }

      this.limpiar();
      await this.listar();
    } catch {
      this.error =
        this.editandoId !== null
          ? 'Error al actualizar tipo de servicio.'
          : 'Error al registrar tipo de servicio.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(t: TipoServicio): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = t.idTipoServicio ?? null;
    this.form = {
      idTipoServicio: t.idTipoServicio,
      nombre: t.nombre ?? ''
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
      this.mensaje = 'Tipo de servicio eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar tipo de servicio (verifica si tiene servicios asociados).';
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