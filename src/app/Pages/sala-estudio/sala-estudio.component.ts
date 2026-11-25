import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SalaEstudio } from '../../models/sala-estudio';

@Component({
  selector: 'app-sala-estudio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sala-estudio.component.html',
  styleUrl: './sala-estudio.component.css'
})
export class SalaEstudioComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8080/v1/SalaEstudio';

  salas: SalaEstudio[] = [];
  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';
  form: SalaEstudio = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): SalaEstudio {
    return { nombre: '', direccion: '', descripcion: '', capacidad: 1 };
  }

  async listar(): Promise<void> {
    this.error = '';
    try {
      const data = await firstValueFrom(this.http.get<SalaEstudio[]>(this.apiUrl));
      this.salas = Array.isArray(data) ? [...data] : [];
      this.cdr.detectChanges();
    } catch {
      this.error = 'No se pudieron cargar las salas.';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const nombreLimpio = (this.form.nombre || '').trim();
    const direccionLimpia = (this.form.direccion || '').trim();
    const descripcionLimpia = (this.form.descripcion || '').trim();
    const capacidadNum = Number(this.form.capacidad);

    if (!nombreLimpio || !direccionLimpia || !descripcionLimpia) {
      this.error = 'Completa nombre, dirección y descripción de la sala.';
      this.cdr.detectChanges();
      return;
    }

    if (isNaN(capacidadNum) || capacidadNum < 1) {
      this.error = 'La capacidad debe ser al menos 1.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: SalaEstudio = {
      ...(this.editandoId !== null ? { idSala: Number(this.editandoId) } : {}),
      nombre: nombreLimpio,
      direccion: direccionLimpia,
      descripcion: descripcionLimpia,
      capacidad: capacidadNum
    };

    try {
      if (this.editandoId !== null) {
        await firstValueFrom(this.http.put<SalaEstudio>(`${this.apiUrl}/${this.editandoId}`, payload));
        this.mensaje = 'Sala actualizada correctamente.';
      } else {
        await firstValueFrom(this.http.post<SalaEstudio>(this.apiUrl, payload));
        this.mensaje = 'Sala registrada correctamente.';
      }

      this.limpiar();
      await this.listar();
    } catch {
      this.error =
        this.editandoId !== null
          ? 'Error al actualizar sala.'
          : 'Error al registrar sala.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(s: SalaEstudio): void {
    this.mensaje = '';
    this.error = '';
    this.editandoId = s.idSala ?? null;
    this.form = {
      idSala: s.idSala,
      nombre: s.nombre ?? '',
      direccion: s.direccion ?? '',
      descripcion: s.descripcion ?? '',
      capacidad: Number(s.capacidad ?? 1)
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
      this.mensaje = 'Sala eliminada correctamente.';
      await this.listar();
    } catch {
      this.error = 'Error al eliminar sala (verifica si tiene reservas asociadas).';
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