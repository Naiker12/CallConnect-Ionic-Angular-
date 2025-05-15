import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/domain/use-cases/login.service';
import { ModalController, LoadingController } from '@ionic/angular';
import { VerificationModalComponent } from 'src/app/shared/components/verification-modal/verification-modal.component';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  form!: FormGroup;
  currentUrl: string;
  showPassword = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastService: CustomToastService,
    private navService: NavigationService
  ) {
    this.currentUrl = this.router.url;
    this.initializeForm();
  }

  ngOnInit() { }

  private initializeForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin(): Promise<void> {
    if (this.form.invalid) {
      this.toastService.error('Por favor completa todos los campos correctamente');
      return;
    }

    const loading = await this.showLoading();
    const { email, password } = this.form.value;

    try {
      const isVerified = await this.loginService.login(email, password);
      await loading.dismiss();
      this.form.reset();

      if (isVerified) {
        this.navService.goToHome();
      } else {
        this.handleUnverifiedUser();
      }

    } catch (error: any) {
      await loading.dismiss();
      this.handleLoginError(error);
    }
  }

  private async handleUnverifiedUser(): Promise<void> {
    await this.presentVerificationModal();
    this.toastService.warning('Por favor verifica tu correo electrónico');
  }

  private handleLoginError(error: unknown): void {
    this.form.reset();

    const errorMessage = this.getErrorMessage(error).toLowerCase();

    if (this.isPasswordError(errorMessage)) {
      this.toastService.error('Contraseña incorrecta. Inténtalo de nuevo');
    } else if (this.isUserError(errorMessage)) {
      this.toastService.error('Usuario no encontrado o correo inválido');
    } else {
      this.toastService.error('Error al iniciar sesión. Por favor intenta nuevamente');
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Error al iniciar sesión';
  }

  private isPasswordError(message: string): boolean {
    return message.includes('contraseña') || message.includes('password');
  }

  private isUserError(message: string): boolean {
    return message.includes('usuario') ||
      message.includes('user') ||
      message.includes('email') ||
      message.includes('correo');
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async presentVerificationModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: VerificationModalComponent,
      componentProps: {
        title: 'Correo no verificado',
        message: 'Por favor verifica tu correo antes de iniciar sesión.'
      }
    });
    await modal.present();
  }

  goToRegister(): void {
    this.navService.goToRegister();
  }

  goToRecover(): void {
    this.navService.goToRecover();
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}