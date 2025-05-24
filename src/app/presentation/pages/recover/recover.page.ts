import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ValidationService } from 'src/app/core/validation/auth/validation.service';
import { RecoverPasswordService } from 'src/app/domain/use-cases/recover-password.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone: false
})
export class RecoverPage {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private recoverService: RecoverPasswordService,
    private toastService: CustomToastService,
    private navService: NavigationService,
    private validationService: ValidationService,
    private loadingService: LoadingService 
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onRecover(): Promise<void> {
    try {
      this.validationService.validateEmail(this.form.get('email'));
      
      await this.loadingService.show('Enviando enlace...');

      await this.recoverService.recover(this.form.value.email);
      
      await this.loadingService.hide();
      
      this.form.reset();
      
      this.toastService.success(
        'Enlace de recuperación enviado. Revisa tu correo.',
        4000,
        '¡Correo enviado!'
      );
      
    } catch (error) {
      await this.loadingService.hide();
      
      this.toastService.handleError(error);
    }
  }

  goToLogin(): void {
    this.navService.goToLogin();
  }
}