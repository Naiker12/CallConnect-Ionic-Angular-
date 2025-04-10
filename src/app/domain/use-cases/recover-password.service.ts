import { Injectable } from '@angular/core';
import { AuthRepository } from '../repositories/auth-repository';


@Injectable({
  providedIn: 'root'
})
export class RecoverPasswordService {
  constructor(private authRepo: AuthRepository) {}

  async recover(email: string): Promise<void> {
    await this.authRepo.sendPasswordResetEmail(email);
  }
}
