import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { User } from 'src/app/core/models/user';
import { RegisterService } from 'src/app/domain/use-cases/register.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ValidationService } from 'src/app/core/validation/auth/validation.service';
import { LoadingService } from 'src/app/core/services/loading.service'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  form!: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private toastService: CustomToastService,
    private navService: NavigationService,
    private validationService: ValidationService,
    private loadingService: LoadingService 
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
      
      await this.loadingService.show('Creando tu cuenta...');

      const userData = this.prepareUserData();
      await this.registerService.registerUser(userData.user, userData.password);
      
      await this.loadingService.hide();
      
      this.form.reset();
      
      this.toastService.success(
        'Verifica tu correo electrónico para activar tu cuenta',
        4000,
        '¡Registro exitoso!'
      );
      
    } catch (error) {
      await this.loadingService.hide();
      
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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.navService.goToLogin();
  }
}