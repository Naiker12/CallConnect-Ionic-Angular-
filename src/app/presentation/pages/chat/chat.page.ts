import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController, ModalController, LoadingController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { Subscription } from 'rxjs';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { Contact } from 'src/app/core/models/contact';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ContactService } from 'src/app/core/services/contact.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone : false
})
export class ChatPage implements OnInit, OnDestroy {
  contact: Contact | null = null;
  userId: string | null = null;
  private contactsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private router: Router,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private contactService: ContactService,
  ) {}

  ngOnInit() {
    this.initializeContactData();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }

  private initializeContactData() {
    this.userId = this.authService.getUserId();
    const contactId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId && contactId) {
      this.loadContact(this.userId, contactId);
    } else {
      this.handleContactNotFound();
    }
  }

  loadContact(userId: string, contactId: string) {
    this.contactService.getContacts(userId).subscribe(contacts => {
      this.contact = contacts.find(c => c.uid === contactId) || null;
    });
  }

  private handleContactNotFound() {
    this.showErrorToast('Contacto no encontrado');
    this.navigateToContacts();
  }

  private cleanupSubscriptions() {
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  async showOptions() {
    if (!this.contact) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del contacto',
      subHeader: this.contact.nombre,
      buttons: [
        {
          text: 'Actualizar',
          icon: 'create-outline',
          handler: () => this.updateContact()
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDelete()
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Nuevos métodos para llamadas
  async startCall(isVideo: boolean = false) {
    if (!this.contact) return;
  
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('La función de llamada solo está disponible en Android');
      this.showToast('Función solo disponible en Android');
      return;
    }
  
    try {
      const meetingId = this.generateMeetingId();
      await (window as any).Capacitor.Plugins.CallConnect.startCall({
        meetingId: meetingId,
        userName: this.contact.nombre || 'Invitado',
        isVideo: isVideo
      });
    } catch (error) {
      console.error('Error al iniciar la llamada:', error);
      this.showToast('Error al iniciar la llamada');
    }
  }
 
  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async confirmDelete() {
    if (!this.contact || !this.userId) return;

    const confirmSheet = await this.actionSheetCtrl.create({
      header: 'Confirmar',
      subHeader: `¿Eliminar a ${this.contact.nombre}?`,
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.showLoading();
            try {
              await this.firebaseContactService.deleteContact(this.userId!, this.contact!.uid);
              await loading.dismiss();
              await this.showToast('Contacto eliminado');
              this.navigateToContacts();
            } catch (error) {
              await loading.dismiss();
              console.error('Error eliminando:', error);
              await this.showToast('Error al eliminar');
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    
    await confirmSheet.present();
  }

  async updateContact() {
    if (!this.contact || !this.userId) return;

    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent,
      componentProps: {
        contactToEdit: {...this.contact},
        isEditMode: true
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data?.success) {
      await this.showToast('Contacto actualizado');
    }
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async showToast(message: string) {
    try {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }

  private showErrorToast(message: string) {
    return this.showToast(message);
  }

  private navigateToContacts() {
    this.navCtrl.navigateBack('/contacts');
  }

  goToCall() {
    this.startCall(false); // Llamada de voz
  }

  goToVideoCall() {
    this.startCall(true); // Llamada de video
  }
}