import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { Contact } from 'src/app/core/models/contact';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ContactService } from 'src/app/core/services/contact.service';
import { Capacitor } from '@capacitor/core';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
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
    private modalCtrl: ModalController,
    private contactService: ContactService,
    private toastService: CustomToastService,
    private navService: NavigationService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.initializeContactData();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }

  private initializeContactData(): void {
    this.userId = this.authService.getUserId();
    const contactId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId && contactId) {
      this.loadContact(this.userId, contactId);
    } else {
      this.handleContactNotFound();
    }
  }

  private loadContact(userId: string, contactId: string): void {
    this.contactsSubscription = this.contactService.getContacts(userId).subscribe({
      next: (contacts) => {
        this.contact = contacts.find(c => c.uid === contactId) || null;
        if (!this.contact) {
          this.handleContactNotFound();
        }
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.toastService.error('Error al cargar el contacto');
        this.navigateToContacts();
      }
    });
  }

  private handleContactNotFound(): void {
    this.toastService.error('Contacto no encontrado');
    this.navigateToContacts();
  }

  private cleanupSubscriptions(): void {
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  async showOptions(): Promise<void> {
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

  async startCall(isVideo: boolean = false): Promise<void> {
    if (!this.contact) return;
  
    if (Capacitor.getPlatform() !== 'android') {
      this.toastService.warning('La función de llamada solo está disponible en Android');
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
      this.toastService.error('Error al iniciar la llamada');
    }
  }
 
  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async confirmDelete(): Promise<void> {
    if (!this.contact || !this.userId) return;

    const confirmSheet = await this.actionSheetCtrl.create({
      header: 'Confirmar',
      subHeader: `¿Eliminar a ${this.contact.nombre}?`,
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.loadingService.show('Eliminando contacto...');
              await this.firebaseContactService.deleteContact(this.userId!, this.contact!.uid);
              this.toastService.success('Contacto eliminado');
              this.navigateToContacts();
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

  async updateContact(): Promise<void> {
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
      this.toastService.success('Contacto actualizado');
    }
  }

  private navigateToContacts(): void {
    this.navService.goToContacts();
  }

  goToCall(): void {
    this.startCall(false);
  }
  
  goToVideoCall(): void {
    this.startCall(true);
  }
}