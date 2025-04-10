// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { auth } from '../firebase/firebase-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
      console.log('Correo de verificación enviado');
    }
    return userCredential.user;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
}
