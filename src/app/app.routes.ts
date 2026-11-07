import { Routes } from '@angular/router';
import { LayoutComponent } from './Pages/layout/layout.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { EmpleadoComponent } from './Pages/empleado/empleado.component';
import { ReservaComponent } from './Pages/reserva/reserva.component';
import { SalaEstudioComponent } from './Pages/sala-estudios/sala-estudio.component'; // Ajusta según el nombre de tu archivo
import { ServicioComponent } from './Pages/servicio/servicio.component';
import { PagoComponent } from './Pages/pago/pago.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';

export const routes: Routes = [
  // Ruta principal (Panel de control con los botones)
  { path: '', component: LayoutComponent },
  
  // Módulos del sistema
  { path: 'clientes', component: ClienteComponent },
  { path: 'empleados', component: EmpleadoComponent },
  { path: 'reservas', component: ReservaComponent },
  { path: 'salas', component: SalaEstudioComponent },
  { path: 'servicios', component: ServicioComponent },
  { path: 'pagos', component: PagoComponent },
  { path: 'usuarios', component: UsuarioComponent },

  // Redirección por defecto si la ruta no existe
  { path: '**', redirectTo: '' }
];