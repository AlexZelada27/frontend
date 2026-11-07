import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models/empleado';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent implements OnInit {
  empleados: Empleado[] = [];
  errorMessage: string = '';

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.empleadoService.listarEmpleados().subscribe({
      next: (data) => {
        this.empleados = data || [];
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
        this.errorMessage = 'No se pudo conectar con el servidor de Spring Boot para obtener los empleados.';
      }
    });
  }
}