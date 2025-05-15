import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ValidationService } from 'src/app/core/validation/services/validation.service';
import { RecoverPasswordService } from 'src/app/domain/use-cases/recover-password.service';


@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone : false
})
export class RecoverPage {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private recoverService: RecoverPasswordService,
    private toastService: CustomToastService,
    private loadingCtrl: LoadingController,
    private navService: NavigationService,
    private validationService: ValidationService
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
      
      this.isLoading = true;
      const loading = await this.showLoading();

      await this.recoverService.recover(this.form.value.email);
      
      await loading.dismiss();
      this.isLoading = false;
      this.form.reset();
      
      this.toastService.success(
        'Enlace de recuperación enviado. Revisa tu correo.',
        4000,
        '¡Correo enviado!'
      );
      
    } catch (error) {
      this.isLoading = false;
      this.toastService.handleError(error);
    }
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando enlace...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  goToLogin(): void {
    this.navService.goToLogin();
  }
}