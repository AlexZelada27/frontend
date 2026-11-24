import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { ReservaService } from './services/reserva.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ReservaService,
          useValue: { listarReservas: () => of([]) },
        },
      ],
    }).compileComponents();
  });

  it('debe crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe mostrar el encabezado real de Estilo Zona', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement as HTMLElement;
    expect(content.querySelector('h2')?.textContent).toContain('Estilo Zona');
  });

  it('debe mostrar el estado vacío cuando no hay reservas', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement as HTMLElement;
    expect(content.textContent).toContain('Cargando registros o la base de datos no devolvió datos');
  });
});
