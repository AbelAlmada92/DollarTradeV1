import { Injectable, inject } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

/**
 * Notificaciones consistentes en toda la app: toasts con el estilo del
 * tema y diálogos de confirmación de Ionic (reemplazan a los alert() y
 * confirm() nativos del navegador).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  success(message: string) {
    return this.present(message, 'success', 'checkmark-circle-outline');
  }

  error(message: string) {
    return this.present(message, 'danger', 'alert-circle-outline', 3400);
  }

  warning(message: string) {
    return this.present(message, 'warning', 'warning-outline', 3000);
  }

  info(message: string) {
    return this.present(message, 'dark', 'information-circle-outline');
  }

  private async present(message: string, color: string, icon: string, duration = 2600) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      icon,
      position: 'top',
      cssClass: 'app-toast',
    });
    await toast.present();
  }

  /** Diálogo de confirmación. Resuelve `true` si el usuario acepta. */
  async confirm(opts: {
    header?: string;
    message: string;
    okText?: string;
    cancelText?: string;
    danger?: boolean;
  }): Promise<boolean> {
    const alert = await this.alertController.create({
      header: opts.header,
      message: opts.message,
      cssClass: 'app-alert',
      buttons: [
        {
          text: opts.okText ?? 'Aceptar',
          role: 'confirm',
          cssClass: opts.danger ? 'alert-btn-danger' : '',
        },
        { text: opts.cancelText ?? 'Cancelar', role: 'cancel' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
