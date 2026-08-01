import { Component, OnInit } from '@angular/core';
import { TradeService } from 'src/app/services/trade';
import { AuthService } from 'src/app/services/auth';
import { NotificationService } from 'src/app/services/notification';
import { Dolar } from 'src/app/interfaces/dolar.interface';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  operaciones: Observable<Dolar[]> = of([]);
  operacionesEnCurso: Observable<Dolar[]> = of([]);
  operacionesRealizadas: Observable<Dolar[]> = of([]);
  segmento: 'en-curso' | 'realizadas' = 'en-curso';
  usuarioActual: any;

  constructor(
    private tradeService: TradeService,
    private auth: AuthService,
    private notify: NotificationService
  ) {}

  async ngOnInit() {
    // Obtener usuario actual
    this.usuarioActual = await this.auth.getCurrentUser();

    // Observable en tiempo real desde Firestore
    this.operaciones = this.tradeService.getOperaciones();

    // Filtrar operaciones en curso (no confirmadas ni canceladas)
    this.operacionesEnCurso = this.operaciones.pipe(
      map(ops => ops.filter(op => !op.confirmado && !op.cancelado))
    );

    // Filtrar operaciones realizadas (confirmadas y no canceladas)
    this.operacionesRealizadas = this.operaciones.pipe(
      map(ops => ops.filter(op => op.confirmado && !op.cancelado))
    );
  }

  // Confirmar operación
  async confirmar(op: Dolar) {
    try {
      await this.tradeService.confirmarOperacion(op);
      this.notify.success('Operación confirmada');
    } catch (error) {
      console.error(error);
      this.notify.warning('No se pudo confirmar');
    }
  }

  // Cancelar operación (solo para el creador)
  async cancelarOperacion(op: Dolar) {
    if (!this.esCreador(op)) return;

    const confirmado = await this.notify.confirm({
      header: 'Cancelar operación',
      message: '¿Seguro que deseas cancelar esta operación?',
      okText: 'Sí, cancelar',
      cancelText: 'Volver',
      danger: true,
    });
    if (!confirmado) return;

    try {
      await this.tradeService.cancelarOperacion(op.id);
      this.notify.info('Operación cancelada');
    } catch (error) {
      console.error(error);
      this.notify.warning('No se pudo cancelar');
    }
  }

  // Verificar si el usuario actual es el creador
  esCreador(op: Dolar) {
    return this.usuarioActual ? op.usuarioNombre === this.usuarioActual.email : false;
  }

  // Descargar comprobante PDF
  descargarPDF(op: Dolar) {
    const esCreador = this.esCreador(op);
    this.tradeService.generarComprobante(op, esCreador);
  }
}











