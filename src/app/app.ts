import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from './services/reserva.service';
import { Reserva } from './models/reserva';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  reservas: Reserva[] = [];
  errorMessage: string = '';

  constructor(
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.getAll().subscribe({
      next: (data) => {
        console.log("Datos obtenidos de Spring Boot:", data);
        this.reservas = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al conectar:', err);
        this.errorMessage = 'No se pudo conectar con el backend. Verifica que Spring Boot esté encendido en el puerto 8080 y que tenga CORS habilitado.';
        this.cdr.detectChanges();
      }
    });
  }
} 