import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TradeService } from 'src/app/services/trade';
import { AuthService } from 'src/app/services/auth';
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
    private toastController: ToastController
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
      this.mostrarToast('✅ Operación confirmada', 'success');
    } catch (error) {
      console.error(error);
      this.mostrarToast('⚠️ No se pudo confirmar', 'warning');
    }
  }

  // Cancelar operación (solo para el creador)
  async cancelarOperacion(op: Dolar) {
    if (!this.esCreador(op)) return;
    if (!confirm('¿Seguro que deseas cancelar esta operación?')) return;

    try {
      await this.tradeService.cancelarOperacion(op.id);
      this.mostrarToast('❌ Operación cancelada', 'danger');
    } catch (error) {
      console.error(error);
      this.mostrarToast('⚠️ No se pudo cancelar', 'warning');
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

  // Mostrar toast
  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom',
      icon: color === 'danger' ? 'close-circle' : 'checkmark-circle',
    });
    await toast.present();
  }
}











