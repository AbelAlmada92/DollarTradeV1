import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { NotificationService } from 'src/app/services/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.notify.error('No pudimos iniciar sesión. Revisá tu email y contraseña.');
    }
  }

  olvideClave() {
    this.notify.info('Para restablecer tu clave, contactá al administrador.');
  }
}

