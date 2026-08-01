import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { NotificationService } from 'src/app/services/notification';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

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
