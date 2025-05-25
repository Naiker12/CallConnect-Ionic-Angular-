import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { ModalController } from '@ionic/angular';
import { EditProfileModalComponent } from 'src/app/shared/components/edit-profile-modal/edit-profile-modal.component';
import { ChangePasswordModalComponent } from 'src/app/shared/components/change-password-modal/change-password-modal.component';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/services/User.service';
import { NavigationService } from 'src/app/core/services/navigation.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit, OnDestroy {
  userData: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private auth: Auth,
    private modalCtrl: ModalController,
    private toastService: CustomToastService,
    private userService: UserService,
    private navService: NavigationService
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.userData = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  goBack() {
    this.navService.goToHome();
  }

  logout() {
    signOut(this.auth).then(() => {
      this.toastService.success('Sesión cerrada correctamente');
      this.navService.logoutAndRedirect();
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
      this.toastService.error('Error al cerrar sesión');
    });
  }

  async editProfile() {
    const modal = await this.modalCtrl.create({
      component: EditProfileModalComponent,
      componentProps: {
        userData: this.userData
      },
      cssClass: 'custom-modal',
      backdropDismiss: false
    });

    await modal.present();
  }

  async changePassword() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
      componentProps: {
        userEmail: this.userData?.correo || ''
      },
      cssClass: 'custom-modal',
      backdropDismiss: false
    });

    await modal.present();
  }

  editPhoto() {
    this.toastService.info('Función de cambio de foto en desarrollo');
  }
}    