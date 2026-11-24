import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  modulos: ModuloNav[] = [
    { titulo: 'Reservas', descripcion: 'Registrar, listar, editar y eliminar reservas.', ruta: '/reservas' },
    { titulo: 'Pagos', descripcion: 'Consultar y registrar pagos del estudio.', ruta: '/pagos' },
    { titulo: 'Clientes', descripcion: 'Administrar clientes registrados.', ruta: '/clientes' },
    { titulo: 'Empleados', descripcion: 'Gestionar personal y cargos.', ruta: '/empleados' },
    { titulo: 'Salas de Estudio', descripcion: 'Administrar salas y capacidades.', ruta: '/salas' },
    { titulo: 'Servicios', descripcion: 'Gestionar servicios y precios.', ruta: '/servicios' },
    { titulo: 'Usuarios', descripcion: 'Administrar cuentas y estados.', ruta: '/usuarios' }
  ];
}