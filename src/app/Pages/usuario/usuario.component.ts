import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  private usuariosUrl = 'http://localhost:8080/v1/Usuario';

  modo: 'login' | 'registro' | 'gestion' = 'login';

  loginCorreo = '';
  loginPassword = '';

  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  rolesActivos: Rol[] = [];
  rolesDisponibles: Rol[] = [];
  editandoId: number | null = null;
  cargando = false;
  mensaje = '';
  error = '';
  form: Usuario = this.nuevoForm();

  ngOnInit(): void {
    void this.cargarInicial();
  }

  private async cargarInicial(): Promise<void> {
    await this.cargarRoles();
    if (this.auth.esAdmin()) {
      await this.listar();
    }
    this.cdr.detectChanges();
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

  estaRolActivo(r: any): boolean {
    const val = r?.estado;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
      const limpio = val.trim().toUpperCase();
      return limpio === 'ACTIVO' || limpio === 'TRUE' || limpio === '1';
    }
    return Boolean(val);
  }

  private actualizarListasRoles(): void {
    this.rolesActivos = (this.roles || []).filter((r) => this.estaRolActivo(r));

    if (this.editandoId !== null && this.form.idRol !== undefined) {
      const rolActual = (this.roles || []).find(
        (r) => Number(this.obtenerIdRolCatalogo(r)) === Number(this.form.idRol)
      );
      if (rolActual && !this.estaRolActivo(rolActual)) {
        this.rolesDisponibles = [rolActual, ...this.rolesActivos];
        return;
      }
    }

    this.rolesDisponibles = [...this.rolesActivos];
  }

  cambiarModo(nuevoModo: 'login' | 'registro' | 'gestion'): void {
    if (nuevoModo === 'gestion' && !this.auth.esAdmin()) {
      this.error = 'Solo un administrador puede administrar usuarios.';
      this.cdr.detectChanges();
      return;
    }

    this.modo = nuevoModo;
    this.mensaje = '';
    this.error = '';

    if (nuevoModo === 'registro') {
      this.editandoId = null;
      this.limpiar();
    } else if (nuevoModo === 'gestion') {
      this.limpiar();
      void this.listar();
    }

    this.cdr.detectChanges();
  }

  limpiarLogin(): void {
    this.loginCorreo = '';
    this.loginPassword = '';
    this.mensaje = '';
    this.error = '';
    this.cdr.detectChanges();
  }

  obtenerIdUsuario(u: any): number | null {
    const id = u?.idUsuario ?? u?.id_usuario ?? u?.id ?? null;
    if (id == null) return null;
    const num = Number(id);
    return isNaN(num) ? null : num;
  }

  private getIdRolUsuario(u: any): number | undefined {
    const id = u?.idRol ?? u?.id_rol ?? u?.rol?.idRol ?? u?.rol?.id_rol ?? u?.rol?.id;
    if (id === undefined || id === null || id === '') return undefined;
    const num = Number(id);
    return isNaN(num) ? undefined : num;
  }

  obtenerIdRolCatalogo(r: any): number | undefined {
    const id = r?.idRol ?? r?.id_rol ?? r?.id;
    if (id === undefined || id === null || id === '') return undefined;
    const num = Number(id);
    return isNaN(num) ? undefined : num;
  }

  private normalizarRoles(data: any[]): Rol[] {
    return (data || []).map((r) => ({
      ...r,
      idRol: this.obtenerIdRolCatalogo(r),
      nombre: (r?.nombre ?? r?.nombreRol ?? r?.rolNombre ?? '').toString().trim(),
      descripcion: (r?.descripcion ?? '').toString().trim(),
      estado: r?.estado
    }));
  }

  async cargarRoles(): Promise<void> {
    try {
      const data = await firstValueFrom(this.auth.obtenerRoles().pipe(timeout(10000)));
      this.roles = this.normalizarRoles(data);
      this.actualizarListasRoles();

      if (this.rolesActivos.length > 0 && this.form.idRol === undefined) {
        const rolCliente = this.rolesActivos.find(
          (r) => (r.nombre || '').toUpperCase() === 'CLIENTE'
        );
        this.form.idRol =
          this.obtenerIdRolCatalogo(rolCliente) ?? this.obtenerIdRolCatalogo(this.rolesActivos[0]);
      }
    } catch {
      this.roles = [];
      this.rolesActivos = [];
      this.rolesDisponibles = [];
    }
  }

  async listar(): Promise<void> {
    if (!this.auth.esAdmin()) return;
    this.error = '';
    try {
      const data = await firstValueFrom(
        this.auth.obtenerUsuariosRegistrados().pipe(timeout(10000))
      );
      this.usuarios = Array.isArray(data) ? [...data] : [];
    } catch {
      this.error = 'No se pudieron cargar los usuarios registrados.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async iniciarSesion(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const correoBuscado = this.loginCorreo.trim().toLowerCase();
    const passIngresada = this.loginPassword;

    if (!correoBuscado || !passIngresada) {
      this.error = 'Ingresa tu correo y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      const lista = await firstValueFrom(
        this.auth.obtenerUsuariosRegistrados().pipe(timeout(10000))
      );
      const usuariosLista = lista || [];
      const encontrado = usuariosLista.find(
        (u) => (u.correo || '').trim().toLowerCase() === correoBuscado
      );

      if (!encontrado) {
        this.error = 'No existe un usuario registrado con ese correo.';
        return;
      }

      const estadoUsuario = (encontrado.estado || 'ACTIVO').toString().trim().toUpperCase();
      if (estadoUsuario === 'INACTIVO') {
        this.error = 'Este usuario se encuentra inactivo.';
        return;
      }

      const passBackend = (encontrado as any).password ?? (encontrado as any).contrasena ?? '';
      if (passBackend && String(passBackend) !== passIngresada) {
        this.error = 'Contraseña incorrecta.';
        return;
      }

      let catalogoRoles = this.roles;
      if (!catalogoRoles.length) {
        const rolesCargados = await firstValueFrom(
          this.auth.obtenerRoles().pipe(timeout(10000))
        );
        catalogoRoles = this.normalizarRoles(rolesCargados);
        this.roles = catalogoRoles;
        this.actualizarListasRoles();
      }

      const idRolUsuario = this.getIdRolUsuario(encontrado);
      const usuarioNormalizado: Usuario = {
        ...encontrado,
        idRol: idRolUsuario
      };

      const rolObj = catalogoRoles.find(
        (r) => Number(this.obtenerIdRolCatalogo(r)) === Number(idRolUsuario)
      );

      const sesion = this.auth.establecerSesionDesdeUsuario(
        usuarioNormalizado,
        rolObj?.nombre,
        catalogoRoles
      );

      this.mensaje = `Bienvenido ${sesion.nombreCompleto} (${sesion.rolNombre})`;

      if (this.auth.esAdmin()) {
        try {
          await this.listar();
        } catch {
          // no bloquear navegación si falla refrescar la lista
        }
      }

      await this.router.navigate(['/panel']);
    } catch {
      this.error = 'No se pudo conectar con el servidor para validar el usuario.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const nombres = (this.form.nombres || '').trim();
    const apellidos = (this.form.apellidos || '').trim();
    const correo = (this.form.correo || '').trim();
    const telefono = (this.form.telefono || '').trim();
    const estado = ((this.form.estado || 'ACTIVO').trim() || 'ACTIVO').toUpperCase();
    const idRolNum = Number(this.form.idRol);

    if (!nombres || !apellidos || !correo || !telefono || !this.form.idRol || isNaN(idRolNum)) {
      this.error = 'Completa todos los campos obligatorios y selecciona un rol.';
      this.cdr.detectChanges();
      return;
    }

    const rolElegido = (this.roles || []).find(
      (r) => Number(this.obtenerIdRolCatalogo(r)) === idRolNum
    );
    if (rolElegido && !this.estaRolActivo(rolElegido) && this.editandoId === null) {
      this.error = 'No se puede registrar un usuario con un rol inactivo.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editandoId === null && !(this.form.password || '').trim()) {
      this.error = 'Ingresa una contraseña para registrar el usuario.';
      this.cdr.detectChanges();
      return;
    }

    const payload: any = {
      nombres,
      apellidos,
      correo,
      telefono,
      idRol: idRolNum,
      id_rol: idRolNum,
      rol: { idRol: idRolNum },
      estado
    };

    if ((this.form.password || '').trim()) {
      payload.password = this.form.password;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      if (this.editandoId !== null && this.auth.esAdmin()) {
        payload.idUsuario = Number(this.editandoId);
        await firstValueFrom(
          this.http
            .put<Usuario>(`${this.usuariosUrl}/${this.editandoId}`, payload)
            .pipe(timeout(10000))
        );
        this.mensaje = 'Usuario actualizado correctamente.';
        this.limpiar();
        try {
          await this.listar();
        } catch {
          // evitar que un error al refrescar la lista deje el estado colgado
        }
      } else {
        const creado = await firstValueFrom(
          this.http.post<Usuario>(this.usuariosUrl, payload).pipe(timeout(10000))
        );
        const correoRegistrado = creado?.correo || correo;
        this.mensaje = 'Usuario registrado correctamente. Ya puedes iniciar sesión.';
        this.limpiar();
        if (this.auth.esAdmin()) {
          try {
            await this.listar();
          } catch {
            // evitar que un error al refrescar la lista deje el estado colgado
          }
        }
        this.loginCorreo = correoRegistrado;
        this.loginPassword = '';
        this.modo = 'login';
      }
    } catch (err: any) {
      const detalle =
        err?.name === 'TimeoutError'
          ? 'El servidor tardó demasiado en responder.'
          : err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '');
      this.error =
        this.editandoId !== null
          ? `Error al actualizar el usuario.${detalle ? ' ' + detalle : ''}`
          : `Error al registrar el usuario.${detalle ? ' ' + detalle : ''}`;
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  editar(u: Usuario): void {
    if (!this.auth.esAdmin()) return;
    this.mensaje = '';
    this.error = '';
    this.modo = 'gestion';
    this.editandoId = this.obtenerIdUsuario(u);
    this.form = {
      idUsuario: this.editandoId ?? undefined,
      nombres: u.nombres || '',
      apellidos: u.apellidos || '',
      correo: u.correo || '',
      telefono: u.telefono || '',
      password: '',
      idRol: this.getIdRolUsuario(u),
      estado: (u.estado || 'ACTIVO').toUpperCase()
    };
    this.actualizarListasRoles();
    this.cdr.detectChanges();
  }

  async eliminar(id: number): Promise<void> {
    if (!this.auth.esAdmin()) return;
    this.mensaje = '';
    this.error = '';
    this.cargando = true;
    this.cdr.detectChanges();

    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.usuariosUrl}/${id}`).pipe(timeout(10000))
      );
      if (this.editandoId !== null && Number(this.editandoId) === Number(id)) {
        this.limpiar();
      }
      this.mensaje = 'Usuario eliminado correctamente.';
      await this.listar();
    } catch {
      this.error = 'No se pudo eliminar el usuario.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  limpiar(): void {
    this.editandoId = null;
    this.form = this.nuevoForm();
    this.actualizarListasRoles();
    if (this.rolesActivos.length > 0) {
      const rolCliente = this.rolesActivos.find(
        (r) => (r.nombre || '').toUpperCase() === 'CLIENTE'
      );
      this.form.idRol =
        this.obtenerIdRolCatalogo(rolCliente) ?? this.obtenerIdRolCatalogo(this.rolesActivos[0]);
    }
  }

  obtenerNombreRol(u: Usuario): string {
    if (u.rol?.nombre) return u.rol.nombre;
    const idRol = this.getIdRolUsuario(u);
    const encontrado = this.roles.find(
      (r) => Number(this.obtenerIdRolCatalogo(r)) === Number(idRol)
    );
    if (encontrado?.nombre) return encontrado.nombre;
    return idRol !== undefined && idRol !== null ? `Rol #${idRol}` : 'Sin rol';
  }
}