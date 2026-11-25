import { Routes } from '@angular/router';
import { LayoutComponent } from './Pages/layout/layout.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { EmpleadoComponent } from './Pages/empleado/empleado.component';
import { ReservaComponent } from './Pages/reserva/reserva.component';
import { SalaEstudioComponent } from './Pages/sala-estudio/sala-estudio.component';
import { ServicioComponent } from './Pages/servicio/servicio.component';
import { PagoComponent } from './Pages/pago/pago.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';
import { HorarioFijoComponent } from './Pages/horarioFijo/horarioFijo.component';
import { BloqueoFechaComponent } from './Pages/bloqueo-fecha/bloqueo-fecha.component';
import { RolComponent } from './Pages/rol/rol.component';
import { TipoServicioComponent } from './Pages/tipo-servicio/tipo-servicio.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: UsuarioComponent },
  { path: 'panel', component: LayoutComponent },
  { path: 'clientes', component: ClienteComponent },
  { path: 'empleados', component: EmpleadoComponent },
  { path: 'reservas', component: ReservaComponent },
  { path: 'salas', component: SalaEstudioComponent },
  { path: 'servicios', component: ServicioComponent },
  { path: 'pagos', component: PagoComponent },
  { path: 'usuarios', component: UsuarioComponent },
  { path: 'horarios', component: HorarioFijoComponent },
  { path: 'bloqueos', component: BloqueoFechaComponent },
  { path: 'roles', component: RolComponent },
  { path: 'tipos-servicio', component: TipoServicioComponent },
  { path: '**', redirectTo: 'login' }
];