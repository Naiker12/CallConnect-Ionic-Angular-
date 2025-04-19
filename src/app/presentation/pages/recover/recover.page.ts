import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecoverPasswordService } from 'src/app/domain/use-cases/recover-password.service';
import { ToastController } from '@ionic/angular';
import { FirebaseError } from 'firebase/app'; 

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone: false
})
export class RecoverPage implements OnInit {

  form: FormGroup;
  currentUrl: string;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private recoverService: RecoverPasswordService,
    private toastCtrl: ToastController
  ) {
    this.currentUrl = this.router.url;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  goToLogin() {
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  async onRecover() {
    if (this.form.invalid) return;

    const email = this.form.value.email;

    try {
      await this.recoverService.recover(email);
      this.form.reset();

      const toast = await this.toastCtrl.create({
        message: ' Enlace de recuperación enviado. Revisa tu correo.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error: any) {
      let message = ' Error al enviar el enlace. Intenta de nuevo.';

      if ((error as FirebaseError).code === 'auth/user-not-found') {
        message = ' Este correo no está registrado.';
      }

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
