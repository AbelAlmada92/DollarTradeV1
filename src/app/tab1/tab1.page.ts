import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, docData, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  usuario: Observable<{ id: string; nombre: string; apellido: string; email: string; dni: string; fechaNacimiento: string } | null> = of(null);
  usuarioEditando: any = null;
  usuarioActual: User | null = null;

  constructor(
    private auth: AuthService,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    // Observamos el estado de autenticación
    this.usuario = this.auth.authState().pipe(
      switchMap(user => {
        if (user) {
          this.usuarioActual = user;
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return docData(userDoc, { idField: 'id' });
        } else {
          this.router.navigate(['/login']);
          return of(null);
        }
      })
    );
  }

  // Editar usuario
  editarUsuario(u: any) {
    this.usuarioEditando = { ...u };
  }

  // Guardar cambios
  async guardarCambios() {
    if (!this.usuarioEditando) return;
    const docRef = doc(this.firestore, `users/${this.usuarioEditando.id}`);
    await updateDoc(docRef, {
      nombre: this.usuarioEditando.nombre,
      apellido: this.usuarioEditando.apellido,
      dni: this.usuarioEditando.dni,
      fechaNacimiento: this.usuarioEditando.fechaNacimiento,
      email: this.usuarioEditando.email
    });
    this.usuarioEditando = null;
  }

  // Cancelar edición
  cancelarEdicion() {
    this.usuarioEditando = null;
  }

  // Eliminar usuario y redirigir al login
  async eliminarUsuario(uid: string) {
    if (!confirm('¿Seguro que deseas eliminar tu cuenta?')) return;
    const docRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(docRef);
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Cerrar sesión
  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}





