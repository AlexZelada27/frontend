import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { Rol } from '../models/rol';

export interface SesionActiva {
  idUsuario?: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  idRol?: number;
  rolNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private usuariosUrl = 'http://localhost:8080/v1/Usuario';
  private rolesUrl = 'http://localhost:8080/v1/Rol';
  private readonly STORAGE_KEY = 'zonestyle_sesion_activa';

  sesion = signal<SesionActiva | null>(this.leerSesion());

  constructor() {
    this.sincronizarRolActual();
  }

  private leerSesion(): SesionActiva | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SesionActiva;
    } catch {
      return null;
    }
  }

  obtenerUsuariosRegistrados(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usuariosUrl);
  }

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<any[]>(this.rolesUrl).pipe(
      map((lista) =>
        (lista || []).map((r) => ({
          ...r,
          idRol: r?.idRol ?? r?.id_rol,
          nombre: r?.nombre ?? r?.nombreRol ?? r?.rolNombre ?? ''
        }))
      ),
      catchError(() => of([]))
    );
  }

  resolverNombreRol(usuario: any, rolesCatalogo: Rol[] = []): string {
    const directo =
      usuario?.rol?.nombre ??
      usuario?.rol?.nombreRol ??
      usuario?.nombreRol ??
      usuario?.rolNombre;

    if (directo && String(directo).trim()) {
      return String(directo).trim().toUpperCase();
    }

    const idRol =
      usuario?.idRol ??
      usuario?.id_rol ??
      usuario?.rol?.idRol ??
      usuario?.rol?.id_rol;

    if (idRol !== undefined && idRol !== null) {
      const encontrado = rolesCatalogo.find(
        (r) => Number(r.idRol ?? (r as any).id_rol) === Number(idRol)
      );
      if (encontrado?.nombre && String(encontrado.nombre).trim()) {
        return String(encontrado.nombre).trim().toUpperCase();
      }
      return `ROL #${idRol}`;
    }

    return 'SIN ROL';
  }

  establecerSesionDesdeUsuario(
    usuario: any,
    rolNombreFallback?: string,
    rolesCatalogo: Rol[] = []
  ): SesionActiva {
    const idUsuario = usuario?.idUsuario ?? usuario?.id_usuario;
    const idRol =
      usuario?.idRol ??
      usuario?.id_rol ??
      usuario?.rol?.idRol ??
      usuario?.rol?.id_rol;

    const nombres = usuario?.nombres ?? '';
    const apellidos = usuario?.apellidos ?? '';

    const resuelto = this.resolverNombreRol(usuario, rolesCatalogo);
    const nombreRol = (
      resuelto !== 'SIN ROL'
        ? resuelto
        : (rolNombreFallback || 'SIN ROL')
    )
      .toString()
      .toUpperCase()
      .trim();

    const datosSesion: SesionActiva = {
      idUsuario,
      nombres,
      apellidos,
      nombreCompleto: `${nombres} ${apellidos}`.trim() || usuario?.correo || 'Usuario',
      correo: usuario?.correo ?? '',
      telefono: usuario?.telefono,
      idRol,
      rolNombre: nombreRol
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(datosSesion));
    this.sesion.set(datosSesion);
    return datosSesion;
  }

  sincronizarRolActual(): void {
    const actual = this.sesion();
    if (!actual) return;

    this.obtenerRoles().subscribe((roles) => {
      if (!roles.length) return;
      const rolPorId = roles.find(
        (r) => Number(r.idRol ?? (r as any).id_rol) === Number(actual.idRol)
      );
      if (rolPorId?.nombre) {
        const actualizado: SesionActiva = {
          ...actual,
          rolNombre: String(rolPorId.nombre).trim().toUpperCase()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actualizado));
        this.sesion.set(actualizado);
      }
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.sesion.set(null);
  }

  esAdmin(): boolean {
    const rol = (this.sesion()?.rolNombre || '').toUpperCase();
    return rol.includes('ADMIN');
  }

  esEmpleado(): boolean {
    const rol = (this.sesion()?.rolNombre || '').toUpperCase();
    return rol.includes('EMPLEADO');
  }

  esCliente(): boolean {
    const rol = (this.sesion()?.rolNombre || '').toUpperCase();
    return rol.includes('CLIENTE');
  }
}