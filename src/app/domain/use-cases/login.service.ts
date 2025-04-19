// src/app/use-cases/login.service.ts
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { VerificationModalComponent } from 'src/app/shared/components/verification-modal/verification-modal.component';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.authService.login(email, password);

      if (user.emailVerified) {
        return true;
      } else {
        await this.modalCtrl.create({
          component: VerificationModalComponent,
          componentProps: {
            message: 'Debes verificar tu correo para poder acceder.'
          }
        }).then(modal => modal.present());
        return false;
      }

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
}
