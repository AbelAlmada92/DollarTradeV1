import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión: ' + (error as any).message);
    }
  }
}

