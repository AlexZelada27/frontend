import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BloqueoFecha } from '../../models/bloqueo-fecha';

interface HorarioItem {
  idHorarioFijo?: number;
  id_horario_fijo?: number;
  id?: number;
  horaInicio?: string;
  hora_inicio?: string;
  inicio?: string;
  horaFin?: string;
  hora_fin?: string;
  fin?: string;
  nombre?: string;
  descripcion?: string;
}

@Component({
  selector: 'app-bloqueo-fecha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bloqueo-fecha.component.html',
  styleUrl: './bloqueo-fecha.component.css'
})
export class BloqueoFechaComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://localhost:8080/v1/bloqueos';
  private horariosUrl = 'http://localhost:8080/v1/HorarioFijo';

  bloqueos: BloqueoFecha[] = [];
  horarios: HorarioItem[] = [];
  horariosSeleccionados: number[] = [];

  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: BloqueoFecha = this.nuevoForm();

  ngOnInit(): void {
    this.cargarInicial();
  }

  nuevoForm(): BloqueoFecha {
    return {
      fecha: new Date().toISOString().slice(0, 10),
      idHorarioFijo: null,
      motivo: ''
    };
  }

  obtenerIdBloqueo(b: any): number | null {
    const id = b?.idBloqueo ?? b?.id_bloqueo ?? b?.id ?? null;
    if (id == null) return null;
    const num = Number(id);
    return isNaN(num) ? null : num;
  }

  obtenerIdHorario(h: any): number | null {
    const id = h?.idHorarioFijo ?? h?.id_horario_fijo ?? h?.id ?? null;
    if (id == null) return null;
    const num = Number(id);
    return isNaN(num) ? null : num;
  }

  estaSeleccionado(id: number | null): boolean {
    if (id === null) return false;
    return this.horariosSeleccionados.includes(Number(id));
  }

  toggleHorario(id: number | null, event: Event): void {
    if (id === null) return;
    const marcado = (event.target as HTMLInputElement).checked;
    const numId = Number(id);

    if (marcado) {
      if (!this.horariosSeleccionados.includes(numId)) {
        this.horariosSeleccionados = [...this.horariosSeleccionados, numId];
      }
    } else {
      this.horariosSeleccionados = this.horariosSeleccionados.filter((item) => item !== numId);
    }
  }

  private getInicio(h: any): string {
    return (h?.horaInicio ?? h?.hora_inicio ?? h?.inicio ?? '').toString();
  }

  private getFin(h: any): string {
    return (h?.horaFin ?? h?.hora_fin ?? h?.fin ?? '').toString();
  }

  formatearHorario(h: HorarioItem): string {
    const ini = this.getInicio(h);
    const fin = this.getFin(h);
    if (ini && fin) return `${ini} - ${fin}`;
    if (ini) return ini;
    return h?.nombre || h?.descripcion || `Horario #${this.obtenerIdHorario(h)}`;
  }

  obtenerEtiquetaHorario(b: any): string {
    const idH = b?.idHorarioFijo ?? b?.id_horario_fijo ?? b?.horarioFijo?.idHorarioFijo ?? null;
    if (idH === null || idH === undefined || idH === '') {
      return 'Todo el día';
    }
    const encontrado = this.horarios.find((h) => this.obtenerIdHorario(h) === Number(idH));
    if (encontrado) {
      return this.formatearHorario(encontrado);
    }
    if (b?.horarioFijo) {
      return this.formatearHorario(b.horarioFijo);
    }
    return `Horario #${idH}`;
  }

  private obtenerIdsOrdenados(): number[] {
    const idsValidos = (this.horariosSeleccionados || [])
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    if (idsValidos.length === 0) return [];

    const ordenCatalogo = new Map<number, number>();
    this.horarios.forEach((h, idx) => {
      const id = this.obtenerIdHorario(h);
      if (id !== null) ordenCatalogo.set(id, idx);
    });

    return Array.from(new Set(idsValidos)).sort((a, b) => {
      const idxA = ordenCatalogo.has(a) ? ordenCatalogo.get(a)! : Number.MAX_SAFE_INTEGER;
      const idxB = ordenCatalogo.has(b) ? ordenCatalogo.get(b)! : Number.MAX_SAFE_INTEGER;
      return idxA - idxB;
    });
  }

  async cargarHorarios(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<HorarioItem[]>(this.horariosUrl));
      this.horarios = Array.isArray(data) ? [...data] : [];
    } catch {
      try {
        const fallback = await firstValueFrom(
          this.http.get<HorarioItem[]>('http://localhost:8080/v1/horario-fijo')
        );
        this.horarios = Array.isArray(fallback) ? [...fallback] : [];
      } catch {
        this.horarios = [];
      }
    }
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<BloqueoFecha[]>(this.apiUrl));
      this.bloqueos = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los bloqueos de fecha.';
      this.cdr.detectChanges();
    }
  }

  async cargarInicial(): Promise<void> {
    await Promise.all([this.cargarHorarios(), this.listar()]);
    this.cdr.detectChanges();
  }

  private extraerDetalleError(err: any): string {
    if (!err) return '';
    if (err.status === 401 || err.status === 403) {
      return 'No autorizado: verifica que la sesión tenga rol ADMIN y envíe el token en la petición.';
    }
    const msg =
      err?.error?.message ||
      err?.error?.error ||
      err?.error?.detail ||
      (typeof err?.error === 'string' ? err.error : '') ||
      err?.message ||
      '';
    return msg ? `(HTTP ${err.status || 'error'}: ${msg})` : `(HTTP ${err.status || 'error'})`;
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const fechaLimpia = (this.form.fecha || '').trim();
    const motivoLimpio = (this.form.motivo || '').trim();

    if (!fechaLimpia || !motivoLimpio) {
      this.error = 'Ingresa la fecha y el motivo del bloqueo.';
      this.cdr.detectChanges();
      return;
    }

    const idsBloques = this.obtenerIdsOrdenados();

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      if (this.editandoId !== null) {
        const idHorarioUnico = idsBloques.length > 0 ? idsBloques[0] : null;
        const payload: BloqueoFecha = {
          idBloqueo: Number(this.editandoId),
          fecha: fechaLimpia,
          idHorarioFijo: idHorarioUnico,
          motivo: motivoLimpio
        };
        await firstValueFrom(this.http.put<BloqueoFecha>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Bloqueo de fecha actualizado correctamente.';
      } else if (idsBloques.length > 1) {
        let creados = 0;
        for (const idH of idsBloques) {
          const payload: BloqueoFecha = {
            fecha: fechaLimpia,
            idHorarioFijo: idH,
            motivo: motivoLimpio
          };
          await firstValueFrom(this.http.post<BloqueoFecha>(this.apiUrl, payload));
          creados++;
        }
        this.mensaje = `Bloqueo registrado para ${creados} horarios seleccionados.`;
      } else {
        const payload: BloqueoFecha = {
          fecha: fechaLimpia,
          idHorarioFijo: idsBloques.length === 1 ? idsBloques[0] : null,
          motivo: motivoLimpio
        };
        await firstValueFrom(this.http.post<BloqueoFecha>(this.apiUrl, payload));
        this.mensaje = 'Bloqueo de fecha registrado correctamente.';
      }

      this.limpiar();
      await this.listar();
    } catch (err: any) {
      const detalle = this.extraerDetalleError(err);
      this.error =
        this.editandoId !== null
          ? `Error al actualizar el bloqueo. ${detalle}`.trim()
          : `Error al registrar el bloqueo. ${detalle}`.trim();
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(b: BloqueoFecha): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = this.obtenerIdBloqueo(b);
    const idH = (b as any)?.idHorarioFijo ?? (b as any)?.id_horario_fijo ?? null;
    this.form = {
      idBloqueo: this.editandoId ?? undefined,
      fecha: b.fecha,
      idHorarioFijo: idH !== null ? Number(idH) : null,
      motivo: b.motivo
    };
    this.horariosSeleccionados = idH !== null ? [Number(idH)] : [];
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
      this.mensaje = 'Bloqueo eliminado correctamente.';
      await this.listar();
    } catch (err: any) {
      const detalle = this.extraerDetalleError(err);
      this.error = `Error al eliminar el bloqueo. ${detalle}`.trim();
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  limpiar(): void {
    this.editandoId = null;
    this.horariosSeleccionados = [];
    this.form = this.nuevoForm();
  }
}