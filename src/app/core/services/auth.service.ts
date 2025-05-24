import { Inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User,
  signOut
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(@Inject(Auth) private auth: Auth) {}
  
  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
      console.log('Correo de verificación enviado');
    }
    return userCredential.user;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }
  
  async logout(): Promise<void> {
    return signOut(this.auth);
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
  
  getUserName(): string | null {
    return this.auth.currentUser?.displayName || this.auth.currentUser?.email || null;
  }
  
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}