import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ModuloNav {
  titulo: string;
  descripcion: string;
  ruta: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  modulos: ModuloNav[] = [
    { titulo: 'Reservas', descripcion: 'Registrar, listar, editar y eliminar reservas según rol.', ruta: '/reservas' },
    { titulo: 'Servicios', descripcion: 'Consultar servicios, tipos de servicio y precios.', ruta: '/servicios' },
    { titulo: 'Tipos de Servicio', descripcion: 'Gestionar categorías o tipos de servicio.', ruta: '/tipos-servicio' },
    { titulo: 'Salas de Estudio', descripcion: 'Administrar salas y capacidades.', ruta: '/salas' },
    { titulo: 'Horarios Fijos', descripcion: 'Administrar bloques horarios y horas.', ruta: '/horarios' },
    { titulo: 'Bloqueos de Fecha', descripcion: 'Gestionar fechas bloqueadas del estudio.', ruta: '/bloqueos' },
    { titulo: 'Pagos', descripcion: 'Consultar pagos por fecha y métodos de pago.', ruta: '/pagos' },
    { titulo: 'Clientes', descripcion: 'Filtrar, editar y administrar clientes registrados.', ruta: '/clientes' },
    { titulo: 'Empleados', descripcion: 'Filtrar, editar y gestionar personal y cargos.', ruta: '/empleados' },
    { titulo: 'Roles', descripcion: 'Administrar roles del sistema.', ruta: '/roles' }
  ];

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}