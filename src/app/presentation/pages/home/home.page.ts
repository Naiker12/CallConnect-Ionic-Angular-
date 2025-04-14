import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController , ToastController} from '@ionic/angular';
import { Contact } from 'src/app/core/models/contact';
import { ContactService } from 'src/app/core/services/contact.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ProfileComponent } from 'src/app/shared/components/profile/profile.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createAnimation } from '@ionic/angular';

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
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
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
        cssClass: 'side-modal',
        enterAnimation: (baseEl: HTMLElement) => {
          // Solución compatible con Ionic 6+
          const root = baseEl.shadowRoot || baseEl;
          const backdrop = root.querySelector('ion-backdrop');
          const wrapper = root.querySelector('.modal-wrapper') as HTMLElement;
  
          if (!backdrop || !wrapper) {
            console.error('No se encontraron elementos de animación');
            return createAnimation();
          }
  
          const backdropAnimation = createAnimation()
            .addElement(backdrop)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
  
          const wrapperAnimation = createAnimation()
            .addElement(wrapper)
            .beforeStyles({
              'transform': 'translateX(-100%)',
              'opacity': '1'
            })
            .fromTo('transform', 'translateX(-100%)', 'translateX(0)');
  
          return createAnimation()
            .addElement(baseEl)
            .easing('cubic-bezier(0.36,0.66,0.04,1)')
            .duration(300)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leaveAnimation: (baseEl: HTMLElement) => {
          const root = baseEl.shadowRoot || baseEl;
          const wrapper = root.querySelector('.modal-wrapper') as HTMLElement;
  
          if (!wrapper) {
            return createAnimation();
          }
  
          return createAnimation()
            .addElement(wrapper)
            .fromTo('transform', 'translateX(0)', 'translateX(-100%)')
            .easing('cubic-bezier(0.36,0.66,0.04,1)')
            .duration(300);
        }
      });
  
      await modal.present();
    } catch (error) {
      console.error('Error al abrir el perfil:', error);
      // Opcional: Mostrar feedback al usuario
      const toast = await this.toastCtrl.create({
        message: 'No se pudo abrir el perfil',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
  
}
