import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecoverPasswordService } from 'src/app/domain/use-cases/recover-password.service';
import { FirebaseError } from 'firebase/app';
import { LoadingController } from '@ionic/angular';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone: false
})
export class RecoverPage implements OnInit {
  form!: FormGroup;
  currentUrl: string;
  isLoading = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private recoverService: RecoverPasswordService,
    private toastService: CustomToastService,
    private loadingCtrl: LoadingController
  ) {
    this.currentUrl = this.router.url;
    this.initializeForm();
  }

  ngOnInit() {}

  private initializeForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  goToLogin(): void {
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  async onRecover(): Promise<void> {
    if (this.form.invalid) {
      this.toastService.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    this.isLoading = true;
    const loading = await this.showLoading();

    try {
      const email = this.form.value.email;
      await this.recoverService.recover(email);
      
      this.form.reset();
      await loading.dismiss();
      this.isLoading = false;
      
      this.toastService.success(
        'Enlace de recuperación enviado. Revisa tu correo.',
        4000,
        '¡Correo enviado!'
      );
      
    } catch (error: unknown) {
      await loading.dismiss();
      this.isLoading = false;
      this.handleRecoveryError(error);
    }
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando enlace...',
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();
    return loading;
  }

  private handleRecoveryError(error: unknown): void {
    if (error instanceof FirebaseError) {
      this.handleFirebaseError(error);
    } else {
      console.error('Error desconocido en recuperación:', error);
      this.toastService.error(
        'Error al enviar el enlace. Por favor intenta nuevamente.',
        3000,
        'Error inesperado'
      );
    }
  }

  private handleFirebaseError(error: FirebaseError): void {
    switch (error.code) {
      case 'auth/user-not-found':
        this.toastService.warning(
          'Este correo no está registrado en nuestro sistema',
          3000,
          'Correo no encontrado'
        );
        break;
        
      case 'auth/too-many-requests':
        this.toastService.error(
          'Demasiados intentos. Por favor espera antes de intentar nuevamente',
          4000,
          'Solicitud bloqueada'
        );
        break;
        
      case 'auth/invalid-email':
        this.toastService.error(
          'El formato del correo electrónico es inválido',
          3000,
          'Correo inválido'
        );
        break;
        
      default:
        this.toastService.error(
          'Error al procesar tu solicitud: ' + error.message,
          4000,
          'Error técnico'
        );
    }
  }
}