import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Contact } from 'src/app/core/models/contact';
import { ContactService } from 'src/app/core/services/contact.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ProfileComponent } from 'src/app/shared/components/profile/profile.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts(): void {
    const userId = this.authService.getUserId?.();
    if (!userId) {
      console.warn('Usuario no autenticado');
      return;
    }

    this.isLoading = true;
    this.contactService.getContacts(userId)
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al obtener contactos:', error);
          this.isLoading = false;
        }
      });
  }
  async openAddContactModal() {
    console.log('Intentando abrir el modal');
    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent
    });
  
    modal.onDidDismiss().then((result) => {
      console.log('Modal cerrado', result);
    });
  
    await modal.present();
    console.log('Modal presentado');
  }
  
  async goToProfile(): Promise<void> {
    try {
      const modal = await this.modalCtrl.create({
        component: ProfileComponent,
        cssClass: 'side-modal'
      });
      return modal.present();
    } catch (error) {
      console.error('Error al abrir el perfil:', error);
    }
  }
}
