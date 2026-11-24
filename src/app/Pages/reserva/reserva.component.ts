import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva';
import { ReservaCreate } from '../../models/reserva-create';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1/Reserva';

  reservas: Reserva[] = [];
  editandoId: number | null = null;
  serviciosTexto = '';
  mensaje = '';
  error = '';
  form: ReservaCreate = this.nuevoForm();

  ngOnInit(): void {
    this.listar();
  }

  nuevoForm(): ReservaCreate {
    return {
      idCliente: 1,
      idEmpleado: 1,
      idHorarioFijo: 1,
      idSala: 1,
      estado: 'CONFIRMADA',
      fechaReserva: new Date().toISOString().slice(0, 10),
      metodoPago: 'EFECTIVO',
      idsServicios: []
    };
  }

  private parsearServicios(texto: string): number[] {
    return texto
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
  }

  listar(): void {
    this.error = '';
    this.http.get<Reserva[]>(this.apiUrl).subscribe({
      next: (data) => (this.reservas = data),
      error: () => (this.error = 'No se pudieron cargar las reservas.')
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';
    this.form.idsServicios = this.parsearServicios(this.serviciosTexto);

    if (this.editandoId !== null) {
      this.http.put<Reserva>(`${this.apiUrl}/${this.editandoId}`, this.form).subscribe({
        next: () => {
          this.mensaje = 'Reserva actualizada correctamente.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar la reserva.')
      });
    } else {
      this.http.post(this.apiUrl, this.form, { responseType: 'text' }).subscribe({
        next: (resp) => {
          this.mensaje = resp || '¡Reserva y pago registrados con éxito!';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al registrar la reserva.')
      });
    }
  }

  editar(r: Reserva): void {
    this.editandoId = r.idReserva ?? null;
    this.form = {
      idCliente: r.idCliente ?? r.cliente?.idCliente ?? 1,
      idEmpleado: r.idEmpleado ?? r.empleado?.idEmpleado ?? 1,
      idHorarioFijo: r.idHorarioFijo ?? r.horarioFijo?.idHorarioFijo ?? 1,
      idSala: r.idSala ?? r.salaEstudio?.idSala ?? 1,
      estado: r.estado ?? 'CONFIRMADA',
      fechaReserva: r.fechaReserva ?? '',
      metodoPago: r.metodoPago ?? 'EFECTIVO',
      idsServicios: []
    };
    this.serviciosTexto = '';
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Reserva eliminada.';
        this.listar();
      },
      error: () => (this.error = 'Error al eliminar la reserva.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.serviciosTexto = '';
    this.form = this.nuevoForm();
  }
}