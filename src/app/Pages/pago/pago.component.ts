import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pago } from '../../models/pago';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  pagos: Pago[] = [];
  errorMessage = '';

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.pagoService.listarPagos().subscribe({
      next: (pagos) => {
        this.pagos = pagos || [];
      },
      error: (error) => {
        console.error('Error al cargar pagos:', error);
        this.errorMessage = 'No se pudo conectar con el servidor de Spring Boot.';
      }
    });
  }
}