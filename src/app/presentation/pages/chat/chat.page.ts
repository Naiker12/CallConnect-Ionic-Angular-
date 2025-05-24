import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Contact } from 'src/app/core/models/contact';
import { Message } from 'src/app/core/models/Message';
import { AuthService } from 'src/app/core/services/auth.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { ChatService } from 'src/app/core/services/Chat.Service';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { ChatFormatters } from 'src/app/core/validation/chats/ChatFormatters';
import { ChatActions } from 'src/app/core/validation/chats/ChatActions';
import { ChatValidators } from 'src/app/core/validation/chats/ChatValidators';

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

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private contactService: ContactService,
    private chatService: ChatService,
    private toastService: CustomToastService,
    private validators: ChatValidators,
    private formatters: ChatFormatters,
    private actions: ChatActions
  ) {}

  ngOnInit() {
    this.initializeChat();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  goToCall(): void { this.actions.handleCallAction('call'); }
  goToVideoCall(): void { this.actions.handleCallAction('video'); }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => this.content?.scrollToBottom(300), 100);
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