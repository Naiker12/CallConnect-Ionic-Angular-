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
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  contact: Contact | null = null;
  userId: string | null = null;
  chatId: string | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isSendingFile: boolean = false;

  private contactsSubscription?: Subscription;
  private messagesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  /**
   * Muestra el ActionSheet para seleccionar tipo de archivo
   */
  async showAttachmentOptions(): Promise<void> {
    if (this.isSendingFile) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Enviar archivo',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => this.sendImageFromCamera()
        },
        {
          text: 'Elegir imagen',
          icon: 'images-outline',
          handler: () => this.sendImageFromGallery()
        },
        {
          text: 'Subir archivo',
          icon: 'document-outline',
          handler: () => this.openFileSelector()
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

  /**
   * Toma una foto con la cámara y la envía
   */
  async sendImageFromCamera(): Promise<void> {
    if (!this.chatId || !this.userId) return;

    const loading = await this.showFileLoading('Tomando foto...');
    this.isSendingFile = true;

    try {
      await this.chatService.sendImageFromCamera(this.chatId, this.userId);
      this.toastService.success('Foto enviada');
    } catch (error) {
      console.error('Error enviando foto:', error);
      this.toastService.error('Error al enviar la foto');
    } finally {
      await loading.dismiss();
      this.isSendingFile = false;
    }
  }

  /**
   * Selecciona una imagen de la galería y la envía
   */
  async sendImageFromGallery(): Promise<void> {
    if (!this.chatId || !this.userId) return;

    const loading = await this.showFileLoading('Seleccionando imagen...');
    this.isSendingFile = true;

    try {
      await this.chatService.sendImageFromGallery(this.chatId, this.userId);
      this.toastService.success('Imagen enviada');
    } catch (error) {
      console.error('Error enviando imagen:', error);
      this.toastService.error('Error al enviar la imagen');
    } finally {
      await loading.dismiss();
      this.isSendingFile = false;
    }
  }

  /**
   * Abre el selector de archivos
   */
  openFileSelector(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Maneja la selección de archivos
   */
  async onFileSelected(event: any): Promise<void> {
    if (!this.chatId || !this.userId) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const loading = await this.showFileLoading('Subiendo archivo...');
    this.isSendingFile = true;

    try {
      // Determinar el tipo de archivo
      let fileType: 'file' | 'audio' = 'file';
      if (file.type.startsWith('audio/')) {
        fileType = 'audio';
      }

      await this.chatService.sendFile(this.chatId, this.userId, file, fileType);
      this.toastService.success('Archivo enviado');
    } catch (error) {
      console.error('Error enviando archivo:', error);
      this.toastService.error('Error al enviar el archivo');
    } finally {
      await loading.dismiss();
      this.isSendingFile = false;
      // Limpiar el input
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  /**
   * Obtiene la URL de visualización para archivos multimedia
   */
  getMediaUrl(message: Message): string {
    return message.content;
  }

  /**
   * Verifica si el mensaje es una imagen
   */
  isImageMessage(message: Message): boolean {
    return message.type === 'image';
  }

  /**
   * Verifica si el mensaje es un audio
   */
  isAudioMessage(message: Message): boolean {
    return message.type === 'audio';
  }

  /**
   * Verifica si el mensaje es un archivo
   */
  isFileMessage(message: Message): boolean {
    return message.type === 'file';
  }

  /**
   * Obtiene el nombre del archivo
   */
  getFileName(message: Message): string {
    return message.metadata?.name || 'Archivo';
  }

  /**
   * Obtiene el tamaño del archivo formateado
   */
  getFileSize(message: Message): string {
    const size = message.metadata?.size;
    if (!size) return '';

    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  /**
   * Abre un archivo en el navegador
   */
  openFile(message: Message): void {
    if (message.content) {
      window.open(message.content, '_blank');
    }
  }

  private async showFileLoading(message: string = 'Procesando archivo...') {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
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
    
    // Si es de esta semana
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (messageDate > weekAgo) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[messageDate.getDay()];
    }
    
    // Para fechas más antiguas
    return messageDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric' 
    });
  }

  /**
   * Funciones adicionales requeridas por el template HTML
   */

  /**
   * Navegar a la pantalla de llamada
   */
  goToCall(): void {
    if (this.contact) {
      // Implementar navegación a llamada
      console.log('Iniciando llamada con:', this.contact.nombre);
      this.toastService.info('Función de llamada no implementada');
    }
  }

  /**
   * Navegar a la pantalla de videollamada
   */
  goToVideoCall(): void {
    if (this.contact) {
      // Implementar navegación a videollamada
      console.log('Iniciando videollamada con:', this.contact.nombre);
      this.toastService.info('Función de videollamada no implementada');
    }
  }

  /**
   * Mostrar opciones del chat
   */
  async showOptions(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del chat',
      buttons: [
        {
          text: 'Ver perfil',
          icon: 'person-outline',
          handler: () => this.viewProfile()
        },
        {
          text: 'Buscar en chat',
          icon: 'search-outline',
          handler: () => this.searchInChat()
        },
        {
          text: 'Silenciar',
          icon: 'notifications-off-outline',
          handler: () => this.muteChat()
        },
        {
          text: 'Limpiar chat',
          icon: 'trash-outline',
          handler: () => this.clearChat()
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

  /**
   * Ver perfil del contacto
   */
  private viewProfile(): void {
    if (this.contact) {
      console.log('Ver perfil de:', this.contact.nombre);
      this.toastService.info('Función de perfil no implementada');
    }
  }

  /**
   * Buscar en el chat
   */
  private searchInChat(): void {
    console.log('Buscar en chat');
    this.toastService.info('Función de búsqueda no implementada');
  }

  /**
   * Silenciar el chat
   */
  private muteChat(): void {
    console.log('Silenciar chat');
    this.toastService.info('Chat silenciado');
  }

  /**
   * Limpiar el chat
   */
  private async clearChat(): Promise<void> {
    // Aquí podrías mostrar un alert de confirmación
    console.log('Limpiar chat');
    this.toastService.info('Función de limpiar chat no implementada');
  }

  /**
   * Manejar cuando no se encuentra el contacto
   */
  private handleContactNotFound(): void {
    this.toastService.error('Contacto no encontrado');
    this.navigateToContacts();
  }

  /**
   * Navegar a la lista de contactos
   */
  private navigateToContacts(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Limpiar suscripciones
   */
  private cleanupSubscriptions(): void {
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }
}