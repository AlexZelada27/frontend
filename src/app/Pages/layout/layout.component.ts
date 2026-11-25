import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ModuloNav {
  clave: string;
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
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  private todosModulos: ModuloNav[] = [
    {
      clave: 'reservas',
      titulo: 'Reservas',
      descripcion: 'Registrar, listar, editar y eliminar reservas según rol.',
      ruta: '/reservas'
    },
    {
      clave: 'servicios',
      titulo: 'Servicios',
      descripcion: 'Consultar servicios, tipos de servicio y precios.',
      ruta: '/servicios'
    },
    {
      clave: 'tipos-servicio',
      titulo: 'Tipos de Servicio',
      descripcion: 'Gestionar categorías o tipos de servicio.',
      ruta: '/tipos-servicio'
    },
    {
      clave: 'salas',
      titulo: 'Salas de Estudio',
      descripcion: 'Administrar salas y capacidades.',
      ruta: '/salas'
    },
    {
      clave: 'horarios',
      titulo: 'Horarios Fijos',
      descripcion: 'Administrar bloques horarios y horas.',
      ruta: '/horarios'
    },
    {
      clave: 'bloqueos',
      titulo: 'Bloqueos de Fecha',
      descripcion: 'Gestionar fechas bloqueadas del estudio.',
      ruta: '/bloqueos'
    },
    {
      clave: 'pagos',
      titulo: 'Pagos',
      descripcion: 'Consultar pagos por fecha y métodos de pago.',
      ruta: '/pagos'
    },
    {
      clave: 'clientes',
      titulo: 'Clientes',
      descripcion: 'Filtrar, editar y administrar clientes registrados.',
      ruta: '/clientes'
    },
    {
      clave: 'empleados',
      titulo: 'Empleados',
      descripcion: 'Filtrar, editar y gestionar personal y cargos.',
      ruta: '/empleados'
    },
    {
      clave: 'roles',
      titulo: 'Roles',
      descripcion: 'Administrar roles del sistema.',
      ruta: '/roles'
    }
  ];

  ngOnInit(): void {
    if (!this.auth.sesion()) {
      this.router.navigate(['/login']);
    }
  }

  get modulos(): ModuloNav[] {
    return this.todosModulos.filter((m) => this.auth.puedeAccederModulo(m.clave));
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}