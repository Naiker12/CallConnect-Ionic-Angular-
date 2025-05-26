import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription, interval } from 'rxjs';
import { Contact } from 'src/app/core/models/contact';
import { Message } from 'src/app/core/models/Message';
import { AuthService } from 'src/app/core/services/auth.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { ChatFormatters } from 'src/app/core/validation/chats/ChatFormatters';
import { ChatActions } from 'src/app/core/validation/chats/ChatActions';
import { ChatValidators } from 'src/app/core/validation/chats/ChatValidators';
import { Capacitor } from '@capacitor/core';
import { ChatService } from 'src/app/core/services/Chat.Service';
import { AudioService } from 'src/app/core/services/chats/audio.Service';


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

  // Variables para grabación de audio
  isRecording: boolean = false;
  recordingDuration: number = 0;
  private recordingTimer?: Subscription;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private contactService: ContactService,
    private chatService: ChatService,
    private toastService: CustomToastService,
    public audioService: AudioService, 
    private validators: ChatValidators,
    private formatters: ChatFormatters,
    private actions: ChatActions
  ) {}

  ngOnInit() {
    this.initializeChat();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.recordingTimer) {
      this.recordingTimer.unsubscribe();
    }
    // Cancelar grabación si está activa
    if (this.isRecording) {
      this.audioService.cancelRecording();
    }
  }

  private async initializeChat(): Promise<void> {
    this.userId = this.authService.getUserId();
    const contactId = this.route.snapshot.paramMap.get('id');
    
    if (!this.userId || !contactId) return;

    this.loadContactAndChat(this.userId, contactId);
  }

  private loadContactAndChat(userId: string, contactId: string): void {
    const contactSub = this.contactService.getContacts(userId).subscribe({
      next: async (contacts) => {
        this.contact = contacts.find(c => c.uid === contactId) || null;
        if (this.validators.validateChatRequirements(this.contact, this.userId)) {
          await this.setupChat();
        }
      },
      error: () => this.toastService.error('Error al cargar el contacto')
    });
    this.subscriptions.push(contactSub);
  }

  private async setupChat(): Promise<void> {
    if (!this.validators.validateChatRequirements(this.contact, this.userId)) return;

    try {
      this.isLoading = true;
      this.chatId = await this.chatService.createOrGetChat(this.userId!, this.contact!.uid);
      this.listenToMessages();
    } catch (error) {
      this.toastService.error('Error al inicializar el chat');
    } finally {
      this.isLoading = false;
    }
  }

  private listenToMessages(): void {
    if (!this.chatId) return;

    const messagesSub = this.chatService.listenToMessages(this.chatId).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.toastService.error('Error al cargar los mensajes')
    });
    this.subscriptions.push(messagesSub);
  }

  async sendMessage(): Promise<void> {
    if (!this.validators.validateMessage(this.newMessage, this.chatId, this.userId)) return;

    const message: Message = {
      senderId: this.userId!,
      type: 'text',
      content: this.newMessage.trim(),
      timestamp: null
    };

    const messageText = this.newMessage;
    this.newMessage = '';

    try {
      await this.chatService.sendMessage(this.chatId!, message);
      this.scrollToBottom();
    } catch (error) {
      this.toastService.error('Error al enviar el mensaje');
      this.newMessage = messageText;
    }
  }

  // Métodos para grabación de audio
  async startRecording(): Promise<void> {
    try {
      const started = await this.audioService.startRecording();
      if (started) {
        this.isRecording = true;
        this.recordingDuration = 0;
        this.startRecordingTimer();
        this.toastService.success('Grabación iniciada');
      }
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.toastService.error('Error al iniciar la grabación');
    }
  }

  async stopRecording(): Promise<void> {
    try {
      if (!this.isRecording) return;

      this.stopRecordingTimer();
      const result = await this.audioService.stopRecording();
      
      if (result.success && result.audioFile) {
        await this.sendAudioMessage(result.audioFile, result.duration || 0);
        this.toastService.success(`Audio enviado (${this.audioService.formatDuration(result.duration || 0)})`);
      } else {
        this.toastService.error('Error al procesar el audio');
      }
    } catch (error) {
      console.error('Error al detener grabación:', error);
      this.toastService.error('Error al procesar el audio');
    } finally {
      this.isRecording = false;
      this.recordingDuration = 0;
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      await this.audioService.cancelRecording();
      this.stopRecordingTimer();
      this.isRecording = false;
      this.recordingDuration = 0;
      this.toastService.info('Grabación cancelada');
    } catch (error) {
      console.error('Error al cancelar grabación:', error);
    }
  }

  private startRecordingTimer(): void {
    this.recordingTimer = interval(1000).subscribe(() => {
      this.recordingDuration++;
    });
  }

  private stopRecordingTimer(): void {
    if (this.recordingTimer) {
      this.recordingTimer.unsubscribe();
      this.recordingTimer = undefined;
    }
  }

  private async sendAudioMessage(audioFile: File, duration: number): Promise<void> {
    if (!this.chatId || !this.userId) return;

    try {
      this.isSendingFile = true;
      await this.chatService.sendFile(this.chatId, this.userId, audioFile, 'audio');
      this.scrollToBottom();
    } catch (error) {
      console.error('Error al enviar audio:', error);
      this.toastService.error('Error al enviar el audio');
    } finally {
      this.isSendingFile = false;
    }
  }

  // Método para manejar el botón del micrófono
  async handleMicrophoneAction(): Promise<void> {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async showAttachmentOptions(): Promise<void> {
    if (this.isSendingFile) return;
    
    const action = await this.actions.showAttachmentOptions();
    if (action && action !== 'file') {
      this.isSendingFile = true;
      await this.actions.handleFileAction(action, this.chatId!, this.userId!);
      this.isSendingFile = false;
    } else if (action === 'file') {
      this.fileInput?.nativeElement.click();
    }
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files?.[0];
    if (!file || !this.validators.validateFileUpload(file)) return;

    this.isSendingFile = true;
    const loading = await this.actions.showFileLoading('Subiendo archivo...');

    try {
      const fileType = this.validators.getFileType(file);
      const allowedFileType: 'audio' | 'file' | undefined = fileType === 'audio' ? 'audio' : 'file';
      await this.chatService.sendFile(this.chatId!, this.userId!, file, allowedFileType);
      this.toastService.success('Archivo enviado');
    } catch (error) {
      this.toastService.error('Error al enviar el archivo');
    } finally {
      await loading.dismiss();
      this.isSendingFile = false;
      this.fileInput.nativeElement.value = '';
    }
  }

  async showOptions(): Promise<void> {
    const action = await this.actions.showChatOptions();
    if (action) await this.actions.handleChatAction(action);
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

  goToCall(): void {
    this.startCall(false);
  }
  
  goToVideoCall(): void {
    this.startCall(true);
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => this.content?.scrollToBottom(300), 100);
  }

  // Método para formatear duración de audio
  formatAudioDuration(message: Message): string {
    const duration = message.metadata?.duration;
    return duration ? this.audioService.formatDuration(duration) : '0:00';
  }

  // Getter para obtener la duración formateada
  get formattedRecordingDuration(): string {
    return this.audioService.formatDuration(this.recordingDuration);
  }

  getMessageLength(message: Message): number {
  if (message.type === 'text') {
    return message.content.length;
  }
  // Para mensajes que no son de texto, retornamos 0 para que sean considerados como 'message-short'
  return 0;
}

  isMyMessage = (message: Message) => this.validators.isMyMessage(message, this.userId);
  formatMessageTime = (timestamp: any) => this.formatters.formatMessageTime(timestamp);
  shouldShowDateSeparator = (index: number) => this.formatters.shouldShowDateSeparator(this.messages, index);
  getDateSeparatorText = (timestamp: any) => this.formatters.getDateSeparatorText(timestamp);
  isImageMessage = (message: Message) => message.type === 'image';
  isAudioMessage = (message: Message) => message.type === 'audio';
  isFileMessage = (message: Message) => message.type === 'file';
  getFileName = (message: Message) => this.formatters.getFileName(message);
  getFileSize = (message: Message) => this.formatters.formatFileSize(message.metadata?.size || 0);
  getMediaUrl = (message: Message) => message.content;
  openFile = (message: Message) => message.content && window.open(message.content, '_blank');
}