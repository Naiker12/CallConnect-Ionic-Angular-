import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Contact } from 'src/app/core/models/contact';
import { Message } from 'src/app/core/models/Message';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';

@Injectable({
  providedIn: 'root'
})
export class ChatValidators {

  constructor(
    private toastService: CustomToastService,
    private router: Router
  ) {}

 
  validateChatRequirements(contact: Contact | null, userId: string | null): boolean {
    if (!userId) {
      this.toastService.error('Usuario no autenticado');
      this.router.navigate(['/auth']);
      return false;
    }

    if (!contact) {
      this.toastService.error('Contacto no encontrado');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }

  validateMessage(message: string, chatId: string | null, userId: string | null): boolean {
    if (!message.trim()) {
      this.toastService.warning('El mensaje no puede estar vacío');
      return false;
    }

    if (!chatId || !userId) {
      this.toastService.error('Error de configuración del chat');
      return false;
    }

    return true;
  }

  validateFileUpload(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
    if (!file) {
      this.toastService.error('No se seleccionó ningún archivo');
      return false;
    }

    if (file.size > maxSize) {
      this.toastService.error('El archivo es demasiado grande (máximo 10MB)');
      return false;
    }

    return true;
  }

  
  getFileType(file: File): 'image' | 'audio' | 'file' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  }

  isMyMessage(message: Message, userId: string | null): boolean {
    return message.senderId === userId;
  }
}