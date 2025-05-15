import { Component, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { UserService } from 'src/app/core/services/User.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/models/user';
import { NavigationService } from 'src/app/core/services/navigation.service';


@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone : false
})
export class SideMenuComponent  {
  userData: User | null = null;
  private userSubscription: Subscription | null = null;

  @Output() menuItemClicked = new EventEmitter<string>();

  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private userService: UserService,
    private modalController: ModalController,
    private navService: NavigationService
  ) {}

  ngOninit(){
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.userData = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }  }

  selectItem(item: string) {
    this.menuItemClicked.emit(item);
    this.closeMenu();
  }

  async closeMenu() {
    await this.modalCtrl.dismiss();
  }

  async openAddContactModal() {
    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent
    });

    modal.onDidDismiss().then((result) => {
    });

    await modal.present();
  }

  logout() {
    signOut(this.auth).then(() => {
      this.modalCtrl.dismiss();
      this.navService.logoutAndRedirect();
    });
  }
}