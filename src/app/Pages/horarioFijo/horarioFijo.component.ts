import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HorarioFijo } from '../../models/horarioFijo';

@Component({
  selector: 'app-horario-fijo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './horarioFijo.component.html',
  styleUrl: './horarioFijo.component.css'
})
export class HorarioFijoComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/HorarioFijo';

  horarios: any[] = [];
  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: HorarioFijo = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): HorarioFijo {
    return {
      horario: '',
      horaFin: ''
    };
  }

  obtenerHoraInicio(h: any): string {
    return (h?.horario ?? h?.horaInicio ?? '').trim();
  }

  obtenerHoraFin(h: any): string {
    return (h?.horaFin ?? h?.hora_fin ?? '').trim();
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      this.horarios = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar los horarios fijos.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const inicioLimpio = (this.form.horario || '').trim();
    const finLimpio = (this.form.horaFin || '').trim();

    if (!inicioLimpio || !finLimpio) {
      this.error = 'Ingresa la hora de inicio y la hora de fin.';
      this.cdr.detectChanges();
      return;
    }

    const existeDuplicado = this.horarios.some((h) => {
      const idActual = Number(h.idHorarioFijo ?? h.id_horario_fijo);
      const mismoId = this.editandoId !== null && idActual === Number(this.editandoId);
      return (
        !mismoId &&
        this.obtenerHoraInicio(h).toLowerCase() === inicioLimpio.toLowerCase() &&
        this.obtenerHoraFin(h).toLowerCase() === finLimpio.toLowerCase()
      );
    });

    if (existeDuplicado) {
      this.error = 'Ya existe un horario fijo con ese mismo rango de horas.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: any = {
      ...(this.editandoId !== null ? { idHorarioFijo: Number(this.editandoId) } : {}),
      horario: inicioLimpio,
      horaInicio: inicioLimpio,
      horaFin: finLimpio
    };

    try {
      if (this.editandoId !== null) {
        await firstValueFrom(this.http.put<HorarioFijo>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Horario fijo actualizado correctamente.';
      } else {
        await firstValueFrom(this.http.post<HorarioFijo>(this.apiUrl, payload));
        this.mensaje = 'Horario fijo registrado correctamente.';
      }

      this.limpiar();
      await this.listar();
    } catch {
      this.error =
        this.editandoId !== null
          ? 'Error al actualizar el horario fijo.'
          : 'Error al registrar el horario fijo.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(h: any): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = h.idHorarioFijo ?? h.id_horario_fijo ?? null;
    this.form = {
      idHorarioFijo: this.editandoId ?? undefined,
      horario: this.obtenerHoraInicio(h),
      horaFin: this.obtenerHoraFin(h)
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
      this.mensaje = 'Horario fijo eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar el horario fijo (verifica si tiene reservas asociadas).';
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