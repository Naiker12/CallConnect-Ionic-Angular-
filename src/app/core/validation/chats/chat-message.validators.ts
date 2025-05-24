import { Injectable } from '@angular/core';
import { ChatMessage } from '../../models/Message';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageValidators {
  
  /**
   * Valida si un mensaje está completo y listo para ser enviado
   */
  validateMessage(message: ChatMessage): boolean {
    if (!message) return false;
    
    // Validar que los campos requeridos existan
    if (!message.senderId || !message.receiverId || !message.text) {
      return false;
    }
    
    // Validar que el texto no esté vacío después de quitar espacios
    if (message.text.trim().length === 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Sanitiza un mensaje para que sea seguro antes de mostrarlo
   */
  sanitizeMessage(message: ChatMessage): ChatMessage {
    if (!message) return message;
    
    // Crear una copia para no modificar el original
    const sanitized = { ...message };
    
    // Sanitizar el texto para evitar inyección de código
    if (sanitized.text) {
      sanitized.text = this.sanitizeText(sanitized.text);
    }
    
    // Sanitizar el nombre del remitente
    if (sanitized.senderName) {
      sanitized.senderName = this.sanitizeText(sanitized.senderName);
    }
    
    return sanitized;
  }
  
  /**
   * Sanitiza un texto para prevenir inyección de código
   */
  private sanitizeText(text: string): string {
    if (!text) return '';
    
    // Reemplazar caracteres especiales de HTML
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}