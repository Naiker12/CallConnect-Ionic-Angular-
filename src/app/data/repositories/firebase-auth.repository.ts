import { Injectable } from '@angular/core';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'src/app/core/firebase/firebase-config';
import { AuthRepository } from 'src/app/domain/repositories/auth-repository';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthRepository implements AuthRepository {
  async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
}
