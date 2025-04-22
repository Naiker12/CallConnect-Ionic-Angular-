import { Component, OnInit } from '@angular/core';
import { Auth, signOut, User } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private auth: Auth,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
    });
  }

  logout() {
    signOut(this.auth).then(() => {
      this.modalCtrl.dismiss();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  editProfile() {
    console.log('Editar perfil');
  }

  editPhoto() {
    console.log('Cambiar foto');
  }
}
