import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  errorMessage: string = '';

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.clienteService.listarClientes().subscribe({
      next: (data) => {
        this.clientes = data || [];
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.errorMessage = 'No se pudo conectar con el servidor de Spring Boot.';
      }
    });
  }
}