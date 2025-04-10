import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';
import { CollectionReference } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ProfileComponent } from 'src/app/shared/components/profile/profile.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone : false
})
export class HomePage implements OnInit {
  contacts$: Observable<any[]> | null = null;
  userId: string | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadContacts(this.userId);
    }
  }

  loadContacts(userId: string) {
    const contactsRef = collection(this.firestore, `users/${userId}/contacts`) as CollectionReference;
    this.contacts$ = collectionData(contactsRef, { idField: 'id' });
  }

  async openAddContactModal() {
    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === true && this.userId) {
        this.loadContacts(this.userId); 
      }
    });

    return await modal.present();
  }

  async goToProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileComponent,
      cssClass: 'side-modal', // <<--- aquí la clase para estilo lateral
    });
    await modal.present();
  }
}
