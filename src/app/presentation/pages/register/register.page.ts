import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { User } from 'src/app/core/models/user';
import { RegisterService } from 'src/app/domain/use-cases/register.service';
import { LoadingController } from '@ionic/angular';
import { FirebaseError } from 'firebase/app';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  form!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private toastService: CustomToastService,
    private loadingCtrl: LoadingController,
    private navService: NavigationService
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
    if (this.form.invalid) {
      this.showFormErrors();
      return;
    }

    this.isLoading = true;
    const loading = await this.showLoading();

    try {
      const userData = this.prepareUserData();
      await this.registerService.registerUser(userData.user, userData.password);
      
      await loading.dismiss();
      this.isLoading = false;
      this.form.reset();
      
      this.toastService.success(
        'Verifica tu correo electrónico para activar tu cuenta',
        4000,
        '¡Registro exitoso!'
      );
    } catch (error: unknown) {
      await loading.dismiss();
      this.isLoading = false;
      this.handleRegistrationError(error);
    }
  }

  private prepareUserData(): { user: User; password: string } {
    const { nombre, apellido, correo, telefono, password } = this.form.value;
    
    return {
      user: {
        nombre,
        apellido,
        correo,
        telefono,
      },
      password
    };
  }

  private showFormErrors(): void {
    if (this.form.get('nombre')?.invalid) {
      this.toastService.warning('Por favor ingresa un nombre válido (solo letras)');
    } else if (this.form.get('apellido')?.invalid) {
      this.toastService.warning('Por favor ingresa un apellido válido (solo letras)');
    } else if (this.form.get('correo')?.invalid) {
      this.toastService.warning('Por favor ingresa un correo electrónico válido');
    } else if (this.form.get('telefono')?.invalid) {
      this.toastService.warning('El teléfono debe tener 10 dígitos');
    } else if (this.form.get('password')?.invalid) {
      this.toastService.warning('La contraseña debe tener al menos 6 caracteres');
    }
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando tu cuenta...',
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();
    return loading;
  }

  private handleRegistrationError(error: unknown): void {
    if (error instanceof FirebaseError) {
      this.handleFirebaseError(error);
    } else {
      console.error('Error desconocido en registro:', error);
      this.toastService.error(
        'Ocurrió un error inesperado durante el registro',
        3000,
        'Error técnico'
      );
    }
  }

  private handleFirebaseError(error: FirebaseError): void {
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.toastService.error(
          'Este correo electrónico ya está registrado',
          3000,
          'Correo en uso'
        );
        break;
        
      case 'auth/weak-password':
        this.toastService.warning(
          'La contraseña debe tener al menos 6 caracteres',
          3000,
          'Contraseña débil'
        );
        break;
        
      case 'auth/invalid-email':
        this.toastService.error(
          'El formato del correo electrónico es inválido',
          3000,
          'Correo inválido'
        );
        break;
        
      case 'auth/operation-not-allowed':
        this.toastService.error(
          'Operación no permitida. Contacta al soporte técnico',
          4000,
          'Error de configuración'
        );
        break;
        
      default:
        this.toastService.error(
          `Error durante el registro: ${error.message}`,
          4000,
          'Error inesperado'
        );
    }
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.navService.goToLogin();
 }
}