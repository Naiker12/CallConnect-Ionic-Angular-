import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController, ModalController, LoadingController, IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { Contact } from 'src/app/core/models/contact';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { ContactService } from 'src/app/core/services/contact.service';
import { Capacitor } from '@capacitor/core';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Message } from 'src/app/core/models/Message';
import { ChatService } from 'src/app/core/services/Chat.Service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  contact: Contact | null = null;
  userId: string | null = null;
  chatId: string | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  private contactsSubscription?: Subscription;
  private messagesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private contactService: ContactService,
    private toastService: CustomToastService,
    private navService: NavigationService,
    private chatService: ChatService
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
      next: async (contacts) => {
        this.contact = contacts.find(c => c.uid === contactId) || null;
        if (!this.contact) {
          this.handleContactNotFound();
        } else {
          await this.initializeChat();
        }
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.toastService.error('Error al cargar el contacto');
        this.navigateToContacts();
      }
    });
  }

  private async initializeChat(): Promise<void> {
    if (!this.userId || !this.contact) return;

    try {
      this.isLoading = true;
      this.chatId = await this.chatService.createOrGetChat(this.userId, this.contact.uid);
      this.listenToMessages();
    } catch (error) {
      console.error('Error initializing chat:', error);
      this.toastService.error('Error al inicializar el chat');
    } finally {
      this.isLoading = false;
    }
  }

  private listenToMessages(): void {
    if (!this.chatId) return;

    this.messagesSubscription = this.chatService.listenToMessages(this.chatId).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error listening to messages:', error);
        this.toastService.error('Error al cargar los mensajes');
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.chatId || !this.userId) return;

    const message: Message = {
      senderId: this.userId,
      type: 'text',
      content: this.newMessage.trim(),
      timestamp: null // Se asignará en el servidor
    };

    const messageText = this.newMessage;
    this.newMessage = ''; // Limpiar input inmediatamente

    try {
      await this.chatService.sendMessage(this.chatId, message);
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      this.toastService.error('Error al enviar el mensaje');
      // Restaurar el mensaje en caso de error
      this.newMessage = messageText;
    }
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.userId;
  }

  formatMessageTime(timestamp: any): string {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const messageDate = new Date(date);
    
    // Si es hoy, mostrar solo la hora
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Si es de ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer ' + messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Si es de esta semana
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (messageDate > weekAgo) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[messageDate.getDay()] + ' ' + messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Para fechas más antiguas
    return messageDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    }) + ' ' + messageDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    
    if (!currentMessage.timestamp || !previousMessage.timestamp) return false;
    
    const currentDate = currentMessage.timestamp.toDate ? 
      currentMessage.timestamp.toDate() : new Date(currentMessage.timestamp);
    const previousDate = previousMessage.timestamp.toDate ? 
      previousMessage.timestamp.toDate() : new Date(previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  getDateSeparatorText(timestamp: any): string {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return messageDate.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
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
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
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
            const loading = await this.showLoading('Eliminando contacto...');
            try {
              await this.firebaseContactService.deleteContact(this.userId!, this.contact!.uid);
              this.toastService.success('Contacto eliminado');
              this.navigateToContacts();
            } catch (error) {
              console.error('Error eliminando:', error);
              this.toastService.error('Error al eliminar el contacto');
            } finally {
              await loading.dismiss();
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

  private async showLoading(message: string = 'Procesando...') {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
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