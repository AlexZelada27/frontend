import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);

  private readonly baseUrl = 'http://localhost:8080/v1';
  private readonly apiUrl = `${this.baseUrl}/Servicio`;

  servicios: Servicio[] = [];
  tiposServicio: any[] = [];
  tiposMap: Record<number, string> = {};

  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: Servicio = this.nuevoForm();

  ngOnInit(): void {
    this.cargarTodo();
  }

  nuevoForm(): Servicio {
    const primerTipoId =
      this.tiposServicio.length > 0
        ? Number(this.tiposServicio[0].idTipoServicio ?? this.tiposServicio[0].id_tipo_servicio ?? 1)
        : 1;

    return {
      idTipoServicio: primerTipoId,
      nombre: '',
      precio: 0
    };
  }

  async cargarTodo(): Promise<void> {
    this.error = '';
    try {
      await Promise.all([
        this.cargarTiposServicio().catch(() => {}),
        this.listar().catch(() => {})
      ]);
      this.servicios = [...this.servicios];
      this.tiposServicio = [...this.tiposServicio];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los datos de servicios.';
      this.cdr.detectChanges();
    }
  }

  async cargarTiposServicio(): Promise<void> {
    let data: any[] = [];
    try {
      const res = await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/TipoServicio`));
      data = Array.isArray(res) ? res : [];
    } catch {
      try {
        const resAlt = await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/Tipo_Servicio`));
        data = Array.isArray(resAlt) ? resAlt : [];
      } catch {
        data = [];
      }
    }

    this.tiposServicio = data;
    this.tiposMap = {};

    for (const t of this.tiposServicio) {
      const id = t.idTipoServicio ?? t.id_tipo_servicio ?? t.id;
      const nombre = t.nombre ?? t.nombreTipoServicio ?? t.descripcion ?? `Tipo #${id}`;
      if (id != null) {
        this.tiposMap[Number(id)] = String(nombre);
      }
    }

    if (!this.editandoId && (!this.form.idTipoServicio || !this.tiposMap[Number(this.form.idTipoServicio)])) {
      const primerId = this.tiposServicio[0]?.idTipoServicio ?? this.tiposServicio[0]?.id_tipo_servicio ?? 1;
      this.form.idTipoServicio = Number(primerId);
    }
  }

  async listar(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Servicio[]>(this.apiUrl));
      this.servicios = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los servicios.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const nombreLimpio = (this.form.nombre || '').trim();
    const idTipo = Number(this.form.idTipoServicio);
    const precioNum = Number(this.form.precio);

    if (!nombreLimpio) {
      this.error = 'Ingresa el nombre del servicio.';
      this.cdr.detectChanges();
      return;
    }

    if (!idTipo || isNaN(idTipo) || idTipo <= 0) {
      this.error = 'Selecciona un tipo de servicio válido.';
      this.cdr.detectChanges();
      return;
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      this.error = 'Ingresa un precio mayor a 0.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: any = {
      ...(this.editandoId !== null ? { idServicio: Number(this.editandoId) } : {}),
      idTipoServicio: idTipo,
      tipoServicio: { idTipoServicio: idTipo },
      nombre: nombreLimpio,
      precio: precioNum
    };

    try {
      if (this.editandoId !== null) {
        await firstValueFrom(this.http.put<Servicio>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Servicio actualizado correctamente.';
      } else {
        await firstValueFrom(this.http.post<Servicio>(this.apiUrl, payload));
        this.mensaje = 'Servicio registrado correctamente.';
      }

      this.limpiar();
      await this.listar();
    } catch {
      this.error =
        this.editandoId !== null
          ? 'Error al actualizar servicio.'
          : 'Error al registrar servicio.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(s: any): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = s.idServicio ?? s.id_servicio ?? null;
    const idTipo =
      s.idTipoServicio ??
      s.id_tipo_servicio ??
      s.tipoServicio?.idTipoServicio ??
      s.tipoServicio?.id_tipo_servicio ??
      1;

    this.form = {
      idServicio: this.editandoId ?? undefined,
      idTipoServicio: Number(idTipo),
      nombre: s.nombre ?? '',
      precio: Number(s.precio ?? 0)
    };
    this.cdr.detectChanges();
  }

  async eliminar(id: number): Promise<void> {
    this.mensaje = '';
    this.error = '';
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
      this.mensaje = 'Servicio eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar servicio.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
  }

  obtenerNombreTipoServicio(s: any): string {
    if (s?.tipoServicio?.nombre) {
      return s.tipoServicio.nombre;
    }
    const idTipo = Number(
      s?.idTipoServicio ??
        s?.id_tipo_servicio ??
        s?.tipoServicio?.idTipoServicio ??
        s?.tipoServicio?.id_tipo_servicio
    );
    if (!isNaN(idTipo) && this.tiposMap[idTipo]) {
      return this.tiposMap[idTipo];
    }
    return idTipo ? `Tipo #${idTipo}` : '-';
  }
}