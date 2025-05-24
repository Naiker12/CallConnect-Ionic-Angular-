import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { User } from 'src/app/core/models/user';
import { RegisterService } from 'src/app/domain/use-cases/register.service';
import { LoadingController } from '@ionic/angular';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ValidationService } from 'src/app/core/validation/services/validation.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone : false
})
export class RegisterPage {
  form!: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private toastService: CustomToastService,
    private loadingCtrl: LoadingController,
    private navService: NavigationService,
    private validationService: ValidationService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*')]],
      apellido: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*')]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit(): Promise<void> {
    try {
      this.validationService.validateRegisterForm(this.form);
      const loading = await this.showLoading();

      const userData = this.prepareUserData();
      await this.registerService.registerUser(userData.user, userData.password);
      
      await loading.dismiss();
      this.form.reset();
      
      this.toastService.success(
        'Verifica tu correo electrónico para activar tu cuenta',
        4000,
        '¡Registro exitoso!'
      );
      
    } catch (error) {
      this.toastService.handleError(error);
    }
  }

  private prepareUserData(): { user: User; password: string } {
    const { nombre, apellido, correo, telefono, password } = this.form.value;
    return {
      user: { nombre, apellido, correo, telefono },
      password
    };
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando tu cuenta...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.navService.goToLogin();
  }
}