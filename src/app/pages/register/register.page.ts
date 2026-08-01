import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { NotificationService } from 'src/app/services/notification';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  user = {
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    dni: '',
    email: '',
    password: ''
  };

  // Fecha máxima seleccionable en el calendario (hoy), formato AAAA-MM-DD
  hoy = new Date().toISOString().substring(0, 10);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  // El date picker nativo devuelve AAAA-MM-DD; lo guardamos como DD/MM/AAAA
  onFechaChange(ev: CustomEvent) {
    const val = (ev.detail as { value?: string }).value;
    if (!val) return;
    const [yyyy, mm, dd] = val.substring(0, 10).split('-');
    this.user.fechaNacimiento = `${dd}/${mm}/${yyyy}`;
  }

  async onRegister() {
    try {
      await this.authService.register(this.user);
      this.notify.success('Cuenta creada correctamente');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en registro:', error);
      this.notify.error('No se pudo crear la cuenta. Intentá de nuevo.');
    }
  }
}
