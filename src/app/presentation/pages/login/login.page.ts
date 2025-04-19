import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/domain/use-cases/login.service';
import { ModalController, LoadingController } from '@ionic/angular';
import { VerificationModalComponent } from 'src/app/shared/components/verification-modal/verification-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  form: FormGroup;
  currentUrl: string;
  showPassword = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {
    this.currentUrl = this.router.url;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

  async onLogin() {
    if (this.form.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });

    await loading.present();

    const { email, password } = this.form.value;

    try {
      const isVerified = await this.loginService.login(email, password);
      this.form.reset();
      await loading.dismiss();

      if (isVerified) {
        this.router.navigate(['/home']);
      } else {
        this.presentVerificationModal();
      }

    } catch (error) {
      await loading.dismiss();
      console.error('Error en login:', error);
      this.form.reset();
    }
  }

  async presentVerificationModal() {
    const modal = await this.modalCtrl.create({
      component: VerificationModalComponent,
      componentProps: {
        title: 'Correo no verificado',
        message: 'Por favor verifica tu correo antes de iniciar sesión.'
      }
    });

    await modal.present();
  }

  goToRegister() {
    if (this.router.url !== '/register') {
      this.router.navigate(['/register']);
    }
  }

  goToRecover() {
    if (this.router.url !== '/recover') {
      this.router.navigate(['/recover']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
