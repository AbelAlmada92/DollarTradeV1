import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async register(userData: any) {
    const { email, password, nombre, apellido, fechaNacimiento, dni } = userData;
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(this.firestore, 'users', uid), {
      nombre,
      apellido,
      fechaNacimiento,
      dni,
      email
    });

    return userCredential;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
   logout() {
    return signOut(this.auth);
  }
    getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  authState$(): Observable<User | null> {
    return new Observable(subscriber => {
      return onAuthStateChanged(this.auth, user => subscriber.next(user));
    });
  }
}

export { Auth };
