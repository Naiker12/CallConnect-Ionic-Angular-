import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { AuthRepository } from 'src/app/domain/repositories/auth-repository';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
  standalone : false
})
export class ChangePasswordModalComponent implements OnInit {
  @Input() userEmail: string = '';
  passwordForm: FormGroup;
  isSubmitting = false;
  resetSent = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private authRepository: AuthRepository,
    private toastService: CustomToastService
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    if (this.userEmail) {
      this.passwordForm.patchValue({
        email: this.userEmail
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async sendResetLink() {
    if (this.passwordForm.invalid) {
      this.toastService.warning('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    this.isSubmitting = true;
    const { email } = this.passwordForm.value;

    try {
      await this.authRepository.sendPasswordResetEmail(email);
      this.resetSent = true;
      this.toastService.success('Se ha enviado un enlace para restablecer tu contraseña');
    } catch (error) {
      console.error('Error sending password reset:', error);
      this.toastService.error('Error al enviar el enlace. Verifica que el correo electrónico sea correcto.');
    } finally {
      this.isSubmitting = false;
    }
  }
}