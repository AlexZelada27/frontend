import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { Rol } from '../../models/rol';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  auth = inject(AuthService);

  private usuariosUrl = 'http://localhost:8080/v1/Usuario';
  private rolesUrl = 'http://localhost:8080/v1/Rol';

  modo: 'login' | 'registro' | 'gestion' = 'login';

  loginCorreo = '';
  loginPassword = '';

  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  form: Usuario = this.nuevoForm();

  ngOnInit(): void {
    this.cargarRoles();
    if (this.auth.esAdmin()) {
      this.listar();
    }
  }

  nuevoForm(): Usuario {
    return {
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      password: '',
      idRol: undefined,
      estado: 'ACTIVO'
    };
  }

  private getIdRolUsuario(u: any): number | undefined {
    return u?.idRol ?? u?.id_rol ?? u?.rol?.idRol ?? u?.rol?.id_rol;
  }

  private getIdRolCatalogo(r: any): number | undefined {
    return r?.idRol ?? r?.id_rol;
  }

  private normalizarRoles(data: any[]): Rol[] {
    return (data || []).map((r) => ({
      ...r,
      idRol: this.getIdRolCatalogo(r),
      nombre: r?.nombre ?? r?.nombreRol ?? r?.rolNombre ?? '',
      descripcion: r?.descripcion ?? '',
      estado: r?.estado
    }));
  }

  cargarRoles(): void {
    this.auth.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = this.normalizarRoles(data);

        if (this.roles.length > 0 && !this.form.idRol) {
          const rolCliente = this.roles.find((r) => (r.nombre || '').toUpperCase() === 'CLIENTE');
          this.form.idRol = rolCliente?.idRol ?? this.roles[0].idRol;
        }
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  listar(): void {
    if (!this.auth.esAdmin()) {
      return;
    }
    this.error = '';
    this.auth.obtenerUsuariosRegistrados().subscribe({
      next: (data) => (this.usuarios = data || []),
      error: () => {
        this.error = 'No se pudieron cargar los usuarios registrados.';
      }
    });
  }

  iniciarSesion(): void {
    this.mensaje = '';
    this.error = '';

    const correoBuscado = this.loginCorreo.trim().toLowerCase();
    const passIngresada = this.loginPassword;

    if (!correoBuscado || !passIngresada) {
      this.error = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.auth.obtenerUsuariosRegistrados().subscribe({
      next: (lista) => {
        const usuariosLista = lista || [];
        const encontrado = usuariosLista.find(
          (u) => (u.correo || '').trim().toLowerCase() === correoBuscado
        );

        if (!encontrado) {
          this.error = 'No existe un usuario registrado con ese correo.';
          return;
        }

        const estadoOk = (encontrado.estado || 'ACTIVO').toUpperCase() !== 'INACTIVO';
        if (!estadoOk) {
          this.error = 'Este usuario se encuentra inactivo.';
          return;
        }

        const passBackend = (encontrado as any).password ?? (encontrado as any).contrasena;
        if (passBackend && passBackend !== passIngresada) {
          this.error = 'Contraseña incorrecta.';
          return;
        }

        const idRolUsuario = this.getIdRolUsuario(encontrado);
        const usuarioNormalizado: Usuario = {
          ...encontrado,
          idRol: idRolUsuario
        };

        const completarLogin = (catalogoRoles: Rol[]) => {
          this.roles = catalogoRoles;
          const rolObj = catalogoRoles.find(
            (r) => Number(this.getIdRolCatalogo(r)) === Number(idRolUsuario)
          );

          const sesion = this.auth.establecerSesionDesdeUsuario(
            usuarioNormalizado,
            rolObj?.nombre,
            catalogoRoles
          );
          this.mensaje = `Bienvenido ${sesion.nombreCompleto} (${sesion.rolNombre})`;

          if (this.auth.esAdmin()) {
            this.listar();
          }

          this.router.navigate(['/panel']);
        };

        if (this.roles.length > 0) {
          completarLogin(this.roles);
        } else {
          this.auth.obtenerRoles().subscribe({
            next: (rolesCargados) => completarLogin(this.normalizarRoles(rolesCargados)),
            error: () => completarLogin([])
          });
        }
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor para validar el usuario.';
      }
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    const payload: any = {
      ...this.form,
      idRol: Number(this.form.idRol),
      id_rol: Number(this.form.idRol)
    };

    if (this.editandoId !== null && this.auth.esAdmin()) {
      this.http.put<Usuario>(`${this.usuariosUrl}/${this.editandoId}`, payload).subscribe({
        next: () => {
          this.mensaje = 'Usuario actualizado correctamente.';
          this.limpiar();
          this.listar();
        },
        error: () => (this.error = 'Error al actualizar el usuario.')
      });
    } else {
      this.http.post<Usuario>(this.usuariosUrl, payload).subscribe({
        next: (creado) => {
          this.mensaje = 'Usuario registrado correctamente. Ya puedes iniciar sesión.';
          this.limpiar();
          if (this.auth.esAdmin()) {
            this.listar();
          }
          if (creado?.correo) {
            this.loginCorreo = creado.correo;
            this.modo = 'login';
          }
        },
        error: () => (this.error = 'Error al registrar el usuario.')
      });
    }
  }

  editar(u: Usuario): void {
    if (!this.auth.esAdmin()) return;
    this.modo = 'gestion';
    this.editandoId = u.idUsuario ?? (u as any).id_usuario ?? null;
    this.form = {
      ...u,
      idRol: this.getIdRolUsuario(u),
      password: ''
    };
  }

  eliminar(id: number): void {
    if (!this.auth.esAdmin()) return;
    this.mensaje = '';
    this.error = '';
    this.http.delete<void>(`${this.usuariosUrl}/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado.';
        this.listar();
      },
      error: () => (this.error = 'No se pudo eliminar el usuario.')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
    if (this.roles.length > 0) {
      const rolCliente = this.roles.find((r) => (r.nombre || '').toUpperCase() === 'CLIENTE');
      this.form.idRol = rolCliente?.idRol ?? this.roles[0].idRol;
    }
  }

  obtenerNombreRol(u: Usuario): string {
    if (u.rol?.nombre) return u.rol.nombre;
    const idRol = this.getIdRolUsuario(u);
    const encontrado = this.roles.find(
      (r) => Number(this.getIdRolCatalogo(r)) === Number(idRol)
    );
    if (encontrado?.nombre) return encontrado.nombre;
    return idRol !== undefined && idRol !== null ? `Rol #${idRol}` : 'Sin rol';
  }
}