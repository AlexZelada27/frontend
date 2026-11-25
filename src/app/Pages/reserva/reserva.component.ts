import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
  private readonly baseUrl = 'http://localhost:8080/v1';
  auth = inject(AuthService);

  reservas: any[] = [];
  clientes: any[] = [];
  empleados: any[] = [];
  horariosFijos: any[] = [];
  salas: any[] = [];
  servicios: any[] = [];
  reservaServicios: any[] = [];
  pagos: any[] = [];

  serviciosMap: Record<number, any> = {};
  horariosMap: Record<number, any> = {};
  pagosMap: Record<number, any> = {};
  detallesPorReservaMap: Record<number, Array<{ idServicio: number; nombre: string; precio: number }>> = {};

  serviciosSeleccionados: number[] = [];
  filtroCliente = '';
  mostrarLista = true;
  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';

  form: {
    idCliente: number | null;
    idEmpleado: number | null;
    idHorarioFijo: number | null;
    idSala: number | null;
    fechaReserva: string;
    estado: string;
    metodoPago: string;
  } = this.crearFormularioVacio();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.auth.esCliente() && this.auth.sesion()?.nombreCompleto) {
      this.filtroCliente = this.auth.sesion()!.nombreCompleto;
    }
    this.cargarTodo();
  }

  obtenerFechaHoyLocal(): string {
    const ahora = new Date();
    const y = ahora.getFullYear();
    const m = String(ahora.getMonth() + 1).padStart(2, '0');
    const d = String(ahora.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  resolverEstadoPorFecha(fechaStr: string | null | undefined, estadoActual?: string): string {
    const normalizado = (estadoActual || 'CONFIRMADO').toUpperCase();
    const hoyStr = this.obtenerFechaHoyLocal();

    if (fechaStr && fechaStr < hoyStr && normalizado !== 'CANCELADO') {
      return 'COMPLETADO';
    }

    if (normalizado === 'CANCELADO' || normalizado === 'COMPLETADO' || normalizado === 'CONFIRMADO') {
      return normalizado;
    }

    return 'CONFIRMADO';
  }

  obtenerEstadoReserva(r: any): string {
    const fecha = r?.fechaReserva ?? r?.fecha_reserva ?? '';
    return this.resolverEstadoPorFecha(fecha, r?.estado);
  }

  private crearFormularioVacio() {
    const hoy = this.obtenerFechaHoyLocal();
    return {
      idCliente: null,
      idEmpleado: null,
      idHorarioFijo: null,
      idSala: null,
      fechaReserva: hoy,
      estado: 'CONFIRMADO',
      metodoPago: 'EFECTIVO'
    };
  }

  private async fetchConTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private async fetchJson(url: string): Promise<any> {
    const res = await this.fetchConTimeout(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status} al consultar ${url}`);
    }
    return res.json();
  }

  async cargarTodo(): Promise<void> {
    try {
      await Promise.all([
        this.cargarCatalogos().catch(() => {}),
        this.cargarPagos().catch(() => {}),
        this.cargarReservaServicio().catch(() => {}),
        this.cargarReservas().catch(() => {})
      ]);
      this.reconstruirMapaDetalles();
      this.reservas = [...this.reservas];
      this.horariosMap = { ...this.horariosMap };
      this.detallesPorReservaMap = { ...this.detallesPorReservaMap };
      this.pagosMap = { ...this.pagosMap };
      this.cdr.detectChanges();
    } catch {
      // Evita que la carga inicial bloquee la vista
    }
  }

  async cargarCatalogos(): Promise<void> {
    const [clientesData, empleadosData, horariosData, salasData, serviciosData] = await Promise.all([
      this.fetchJson(`${this.baseUrl}/Cliente`).catch(() => []),
      this.fetchJson(`${this.baseUrl}/Empleado`).catch(() => []),
      this.fetchJson(`${this.baseUrl}/HorarioFijo`).catch(() => []),
      this.fetchJson(`${this.baseUrl}/SalaEstudio`).catch(() =>
        this.fetchJson(`${this.baseUrl}/Sala`).catch(() => [])
      ),
      this.fetchJson(`${this.baseUrl}/Servicio`).catch(() => [])
    ]);

    this.clientes = Array.isArray(clientesData) ? clientesData : [];
    this.empleados = Array.isArray(empleadosData) ? empleadosData : [];
    this.horariosFijos = Array.isArray(horariosData) ? horariosData : [];
    this.salas = Array.isArray(salasData) ? salasData : [];
    this.servicios = Array.isArray(serviciosData) ? serviciosData : [];

    this.serviciosMap = {};
    for (const srv of this.servicios) {
      const id = srv.idServicio ?? srv.id_servicio;
      if (id != null) {
        this.serviciosMap[Number(id)] = srv;
      }
    }

    this.horariosMap = {};
    for (const h of this.horariosFijos) {
      const id = h.idHorarioFijo ?? h.id_horario_fijo ?? h.id;
      if (id != null) {
        this.horariosMap[Number(id)] = h;
      }
    }
  }

  async cargarPagos(): Promise<void> {
    const data = await this.fetchJson(`${this.baseUrl}/Pago`).catch(() => []);
    this.pagos = Array.isArray(data) ? data : [];
    this.pagosMap = {};

    for (const p of this.pagos) {
      const idPago = p.idPago ?? p.id_pago;
      const idReserva = p.idReserva ?? p.id_reserva ?? p.reserva?.idReserva ?? p.reserva?.id_reserva;
      if (idPago != null) this.pagosMap[Number(idPago)] = p;
      if (idReserva != null) this.pagosMap[Number(idReserva)] = p;
    }
  }

  async cargarReservaServicio(): Promise<void> {
    const data = await this.fetchJson(`${this.baseUrl}/ReservaServicio`).catch(() => []);
    this.reservaServicios = Array.isArray(data) ? data : [];
  }

  async cargarReservas(): Promise<void> {
    const data = await this.fetchJson(`${this.baseUrl}/Reserva`).catch(() => []);
    this.reservas = Array.isArray(data) ? data : [];
  }

  private extraerIdHorario(r: any): number | null {
    const raw =
      r?.idHorarioFijo ??
      r?.id_horario_fijo ??
      r?.horarioFijo?.idHorarioFijo ??
      r?.horarioFijo?.id_horario_fijo ??
      r?.horario?.idHorarioFijo ??
      r?.horario?.id_horario_fijo ??
      null;
    if (raw == null) return null;
    const num = Number(raw);
    return isNaN(num) ? null : num;
  }

  private existeCruceHorarioFecha(): boolean {
    const fechaNueva = (this.form.fechaReserva || '').trim();
    const idHorarioNuevo = Number(this.form.idHorarioFijo);

    if (!fechaNueva || isNaN(idHorarioNuevo)) return false;

    return this.reservas.some((r) => {
      const idRes = Number(r.idReserva ?? r.id_reserva);
      if (this.editandoId != null && !isNaN(idRes) && idRes === Number(this.editandoId)) {
        return false;
      }

      if (this.obtenerEstadoReserva(r) === 'CANCELADO') {
        return false;
      }

      const fechaExistente = (r.fechaReserva ?? r.fecha_reserva ?? '').trim();
      const idHorarioExistente = this.extraerIdHorario(r);

      return fechaExistente === fechaNueva && idHorarioExistente === idHorarioNuevo;
    });
  }

  reconstruirMapaDetalles(): void {
    this.detallesPorReservaMap = {};

    for (const rs of this.reservaServicios) {
      const idReserva = rs.idReserva ?? rs.id_reserva ?? rs.reserva?.idReserva ?? rs.reserva?.id_reserva;
      const idServicio = rs.idServicio ?? rs.id_servicio ?? rs.servicio?.idServicio ?? rs.servicio?.id_servicio;
      if (idReserva == null || idServicio == null) continue;

      const srv = this.serviciosMap[Number(idServicio)];
      const nombre = srv?.nombre ?? srv?.nombreServicio ?? rs.nombreServicio ?? `Servicio #${idServicio}`;
      const precio = Number(rs.precio ?? srv?.precio ?? srv?.costo ?? 0);

      const key = Number(idReserva);
      if (!this.detallesPorReservaMap[key]) {
        this.detallesPorReservaMap[key] = [];
      }
      this.detallesPorReservaMap[key].push({
        idServicio: Number(idServicio),
        nombre,
        precio
      });
    }
  }

  estaServicioSeleccionado(idServicio: any): boolean {
    if (idServicio == null) return false;
    return this.serviciosSeleccionados.includes(Number(idServicio));
  }

  toggleServicio(idServicio: any): void {
    if (idServicio == null) return;
    const idNum = Number(idServicio);
    if (this.serviciosSeleccionados.includes(idNum)) {
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter((id) => id !== idNum);
    } else {
      this.serviciosSeleccionados = [...this.serviciosSeleccionados, idNum];
    }
  }

  calcularMontoTotal(): number {
    return this.serviciosSeleccionados.reduce((acc, idSrv) => {
      const srv = this.serviciosMap[Number(idSrv)];
      const precio = Number(srv?.precio ?? srv?.costo ?? 0);
      return acc + (isNaN(precio) ? 0 : precio);
    }, 0);
  }

  async guardar(): Promise<void> {
    this.error = '';
    this.mensaje = '';

    if (this.editandoId && !this.auth.puedeEditarReserva()) {
      this.error = 'No tienes permiso para editar reservas.';
      this.cdr.detectChanges();
      return;
    }

    const hoyStr = this.obtenerFechaHoyLocal();
    if (!this.editandoId && (!this.form.fechaReserva || this.form.fechaReserva < hoyStr)) {
      this.error = `No se puede registrar una reserva con fecha pasada. Selecciona desde ${hoyStr} en adelante.`;
      this.cdr.detectChanges();
      return;
    }

    if (!this.form.idCliente || !this.form.idEmpleado || !this.form.idHorarioFijo || !this.form.idSala) {
      this.error = 'Completa cliente, empleado, horario y sala antes de guardar.';
      this.cdr.detectChanges();
      return;
    }

    await this.cargarReservas().catch(() => {});
    if (this.existeCruceHorarioFecha()) {
      const hObj = this.horariosMap[Number(this.form.idHorarioFijo)];
      const textoHorario = hObj ? this.obtenerTextoHorario(hObj) : 'seleccionado';
      this.error = `Ya existe una reserva en la fecha ${this.form.fechaReserva} para el horario ${textoHorario}. Elige otro horario o fecha.`;
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      const montoTotal = this.calcularMontoTotal();
      const fueEdicion = !!this.editandoId && this.auth.puedeEditarReserva();
      const estadoBase = fueEdicion ? this.form.estado : 'CONFIRMADO';
      const estadoFinal = this.resolverEstadoPorFecha(this.form.fechaReserva, estadoBase);

      const reservaActual = fueEdicion
        ? this.reservas.find((item) => Number(item.idReserva ?? item.id_reserva) === Number(this.editandoId))
        : null;

      let idPagoFinal: number | null =
        reservaActual?.idPago ??
        reservaActual?.id_pago ??
        reservaActual?.pago?.idPago ??
        reservaActual?.pago?.id_pago ??
        null;

      try {
        const pagoUrl = idPagoFinal ? `${this.baseUrl}/Pago/${idPagoFinal}` : `${this.baseUrl}/Pago`;
        const pagoMethod = idPagoFinal ? 'PUT' : 'POST';
        const resPago = await this.fetchConTimeout(pagoUrl, {
          method: pagoMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(idPagoFinal ? { idPago: Number(idPagoFinal) } : {}),
            monto: montoTotal,
            metodoPago: this.form.metodoPago
          })
        });
        if (resPago.ok) {
          const pagoData = await resPago.json().catch(() => null);
          idPagoFinal = pagoData?.idPago ?? pagoData?.id_pago ?? idPagoFinal;
        }
      } catch {
        // Continúa aunque /Pago no aplique aparte o tarde
      }

      const reservaPayload: any = {
        ...(fueEdicion ? { idReserva: Number(this.editandoId) } : {}),
        idCliente: Number(this.form.idCliente),
        idEmpleado: Number(this.form.idEmpleado),
        idHorarioFijo: Number(this.form.idHorarioFijo),
        idSala: Number(this.form.idSala),
        cliente: { idCliente: Number(this.form.idCliente) },
        empleado: { idEmpleado: Number(this.form.idEmpleado) },
        horarioFijo: { idHorarioFijo: Number(this.form.idHorarioFijo) },
        sala: { idSala: Number(this.form.idSala) },
        fechaReserva: this.form.fechaReserva,
        estado: estadoFinal,
        metodoPago: this.form.metodoPago,
        monto: montoTotal,
        idsServicios: this.serviciosSeleccionados
      };

      if (idPagoFinal != null) {
        reservaPayload.idPago = Number(idPagoFinal);
        reservaPayload.pago = {
          idPago: Number(idPagoFinal),
          monto: montoTotal,
          metodoPago: this.form.metodoPago
        };
      }

      const url = fueEdicion ? `${this.baseUrl}/Reserva/${this.editandoId}` : `${this.baseUrl}/Reserva`;
      const method = fueEdicion ? 'PUT' : 'POST';

      const resReserva = await this.fetchConTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaPayload)
      });

      if (!resReserva.ok) {
        const detalle = await resReserva.text().catch(() => '');
        throw new Error(`Error ${resReserva.status} al guardar reserva. ${detalle}`);
      }

      const reservaGuardada = await resReserva.json().catch(() => null);
      const idReservaFinal = Number(
        reservaGuardada?.idReserva ?? reservaGuardada?.id_reserva ?? this.editandoId
      );

      if (!isNaN(idReservaFinal) && idReservaFinal > 0) {
        if (fueEdicion) {
          const relacionesExistentes = this.reservaServicios.filter((rs) => {
            const idR = rs.idReserva ?? rs.id_reserva ?? rs.reserva?.idReserva ?? rs.reserva?.id_reserva;
            return Number(idR) === idReservaFinal;
          });

          await Promise.all(
            relacionesExistentes.map((rs) => {
              const idRel = rs.idReservaServicio ?? rs.id_reserva_servicio ?? rs.id;
              if (!idRel) return Promise.resolve(null);
              return this.fetchConTimeout(`${this.baseUrl}/ReservaServicio/${idRel}`, {
                method: 'DELETE'
              }).catch(() => null);
            })
          );
        }

        if (this.serviciosSeleccionados.length > 0) {
          await Promise.all(
            this.serviciosSeleccionados.map((idSrv) => {
              const srv = this.serviciosMap[Number(idSrv)];
              const precioSrv = Number(srv?.precio ?? srv?.costo ?? 0);
              return this.fetchConTimeout(`${this.baseUrl}/ReservaServicio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  idReserva: idReservaFinal,
                  idServicio: Number(idSrv),
                  reserva: { idReserva: idReservaFinal },
                  servicio: { idServicio: Number(idSrv) },
                  precio: precioSrv
                })
              }).catch(() => null);
            })
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
      await this.cargarTodo();

      this.limpiar();
      this.guardando = false;
      this.mensaje = fueEdicion
        ? 'Reserva actualizada correctamente.'
        : 'Reserva registrada correctamente.';
      this.cdr.detectChanges();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        this.error = 'La petición tardó demasiado, pero pudo haberse guardado. Revisa la tabla.';
      } else {
        this.error = err?.message || 'No se pudo guardar la reserva.';
      }
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  editar(r: any): void {
    if (!this.auth.puedeEditarReserva()) {
      this.error = 'No tienes permiso para editar reservas.';
      this.cdr.detectChanges();
      return;
    }

    this.editandoId = r.idReserva ?? r.id_reserva ?? null;
    const fecha = r.fechaReserva ?? r.fecha_reserva ?? '';
    this.form = {
      idCliente: r.idCliente ?? r.id_cliente ?? r.cliente?.idCliente ?? null,
      idEmpleado: r.idEmpleado ?? r.id_empleado ?? r.empleado?.idEmpleado ?? null,
      idHorarioFijo: r.idHorarioFijo ?? r.id_horario_fijo ?? r.horarioFijo?.idHorarioFijo ?? null,
      idSala: r.idSala ?? r.id_sala ?? r.sala?.idSala ?? null,
      fechaReserva: fecha,
      estado: this.resolverEstadoPorFecha(fecha, r.estado),
      metodoPago:
        r.metodoPago ??
        r.metodo_pago ??
        r.pago?.metodoPago ??
        r.pago?.metodo_pago ??
        'EFECTIVO'
    };

    const idRes = Number(this.editandoId);
    const detalles = this.detallesPorReservaMap[idRes] || [];
    this.serviciosSeleccionados = detalles.map((d) => d.idServicio);
    this.cdr.detectChanges();
  }

  async eliminar(id: number): Promise<void> {
    if (!this.auth.puedeEliminarReserva()) {
      this.error = 'No tienes permiso para eliminar reservas.';
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    this.mensaje = '';
    try {
      const res = await this.fetchConTimeout(`${this.baseUrl}/Reserva/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.mensaje = 'Reserva eliminada.';
        await this.cargarTodo();
      } else {
        this.error = 'No se pudo eliminar la reserva.';
      }
    } catch {
      this.error = 'Error de conexión al eliminar la reserva.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  limpiar(): void {
    this.editandoId = null;
    this.serviciosSeleccionados = [];
    this.form = this.crearFormularioVacio();
  }

  alternarLista(): void {
    this.mostrarLista = !this.mostrarLista;
  }

  get reservasFiltradas(): any[] {
    const q = this.filtroCliente.trim().toLowerCase();
    if (!q) return this.reservas;
    return this.reservas.filter((r) => {
      const nombre = (
        r.clienteNombre ||
        r.nombreCliente ||
        r.cliente?.nombre ||
        ((r.cliente?.nombres || '') + ' ' + (r.cliente?.apellidos || '')).trim() ||
        ''
      ).toLowerCase();
      const id = String(r.idCliente ?? r.id_cliente ?? r.cliente?.idCliente ?? '');
      return nombre.includes(q) || id.includes(q);
    });
  }

  obtenerNombreCliente(c: any): string {
    return (
      c?.nombre ||
      c?.nombreCompleto ||
      `${c?.nombres ?? ''} ${c?.apellidos ?? ''}`.trim() ||
      `Cliente #${c?.idCliente ?? c?.id_cliente}`
    );
  }

  obtenerNombreEmpleado(e: any): string {
    return (
      e?.nombre ||
      e?.nombreCompleto ||
      `${e?.nombres ?? ''} ${e?.apellidos ?? ''}`.trim() ||
      `Empleado #${e?.idEmpleado ?? e?.id_empleado}`
    );
  }

  obtenerTextoHorario(h: any): string {
    if (h?.horaInicio && h?.horaFin) {
      return `${h.horaInicio} - ${h.horaFin}`;
    }
    return h?.descripcion || `Horario #${h?.idHorarioFijo ?? h?.id_horario_fijo}`;
  }

  obtenerHorarioReserva(r: any): string {
    if (r?.horarioTexto || r?.rangoHorario || r?.horarioDescripcion) {
      return r.horarioTexto || r.rangoHorario || r.horarioDescripcion;
    }

    const objHorario = r?.horarioFijo ?? r?.horario_fijo ?? r?.horario;
    if (objHorario && (objHorario.horaInicio || objHorario.horaFin || objHorario.descripcion)) {
      return this.obtenerTextoHorario(objHorario);
    }

    const idHorario = Number(
      r?.idHorarioFijo ?? r?.id_horario_fijo ?? objHorario?.idHorarioFijo ?? objHorario?.id_horario_fijo
    );

    if (!isNaN(idHorario) && this.horariosMap[idHorario]) {
      return this.obtenerTextoHorario(this.horariosMap[idHorario]);
    }

    return '-';
  }

  obtenerNombreServicios(r: any): string {
    const idReserva = Number(r.idReserva ?? r.id_reserva);
    const detalles = this.detallesPorReservaMap[idReserva] || [];
    if (detalles.length > 0) {
      return detalles.map((d) => d.nombre).join(', ');
    }
    return '-';
  }
}