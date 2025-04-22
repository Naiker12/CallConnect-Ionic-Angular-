import { Component, OnInit } from '@angular/core';
import {  Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-verification-modal',
  templateUrl: './verification-modal.component.html',
  styleUrls: ['./verification-modal.component.scss'],
  standalone : false
})
export class VerificationModalComponent  implements OnInit {

  @Input() email!: string;
  @Input() title: string = 'Verifica tu correo';
  @Input() message: string = 'Hemos enviado un enlace de verificación a tu correo electrónico. Verifícalo para poder acceder.';

  constructor(private modalCtrl: ModalController , private router: Router) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  get emailMasked() {
    const [name, domain] = this.email.split('@');
    const maskedName = name.slice(0, 0) + '***';
    return `${maskedName}@${domain}`;
  }

  goToLogin() {
    this.closeModal();
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  resendCode() {
    console.log('Código reenviado a:', this.emailMasked);
  }


}