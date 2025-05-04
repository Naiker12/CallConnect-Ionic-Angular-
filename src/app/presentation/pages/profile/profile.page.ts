// profile.page.ts
import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone : false
})
export class ProfilePage implements OnInit {
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

  goBack() {
    this.router.navigate(['/home']);
  }

  logout() {
    signOut(this.auth).then(() => {
      this.modalCtrl.dismiss();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }

  editProfile() {
    console.log('Editar perfil');
  }

  editPhoto() {
    console.log('Cambiar foto');
  }
}