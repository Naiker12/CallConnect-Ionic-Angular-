import { Injectable } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Contact } from 'src/app/core/models/contact';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ChatValidators } from './validators';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private toastService: CustomToastService,
    private loadingService: LoadingService,
    private firebaseContactService: FirebaseContactService,
    private navService: NavigationService
  ) {}

  async showContactOptions(contact: Contact, userId: string): Promise<void> {
    if (!contact) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del contacto',
      subHeader: contact.nombre,
      buttons: [
        {
          text: 'Actualizar',
          icon: 'create-outline',
          handler: () => this.updateContact(contact, userId)
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDelete(contact, userId)
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

  async startCall(contact: Contact, isVideo: boolean = false): Promise<void> {
    if (!contact) return;
  
    if (!ChatValidators.validateCallSupport(this.toastService)) {
      return;
    }
  
    try {
      const meetingId = ChatValidators.generateMeetingId();
      await (window as any).Capacitor.Plugins.CallConnect.startCall({
        meetingId: meetingId,
        userName: contact.nombre || 'Invitado',
        isVideo: isVideo
      });
    } catch (error) {
      console.error('Error al iniciar la llamada:', error);
      this.toastService.error('Error al iniciar la llamada');
    }
  }

  private async confirmDelete(contact: Contact, userId: string): Promise<void> {
    if (!contact || !userId) return;

    const confirmSheet = await this.actionSheetCtrl.create({
      header: 'Confirmar',
      subHeader: `¿Eliminar a ${contact.nombre}?`,
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.loadingService.show('Eliminando contacto...');
              await this.firebaseContactService.deleteContact(userId, contact.uid);
              this.toastService.success('Contacto eliminado');
              this.navService.goToContacts();
            } catch (error) {
              console.error('Error eliminando:', error);
              this.toastService.error('Error al eliminar el contacto');
            } finally {
              await this.loadingService.hide();
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

  async updateContact(contact: Contact, userId: string): Promise<void> {
    if (!contact || !userId) return;

    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent,
      componentProps: {
        contactToEdit: {...contact},
        isEditMode: true
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data?.success) {
      this.toastService.success('Contacto actualizado');
    }
  }
}