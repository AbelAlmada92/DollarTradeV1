import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

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

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    try {
      await this.authService.register(this.user);
      alert('Usuario registrado correctamente');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error al registrar: ' + (error as any).message);
    }
  }
}
