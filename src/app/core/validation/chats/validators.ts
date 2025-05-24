import { Contact } from 'src/app/core/models/contact';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Capacitor } from '@capacitor/core';

export class ChatValidators {

  static validateContactExists(
    contact: Contact | null, 
    toastService: CustomToastService,
    navService: NavigationService
  ): boolean {
    if (!contact) {
      toastService.error('Contacto no encontrado');
      navService.goToContacts();
      return false;
    }
    return true;
  }

  static validateCallSupport(toastService: CustomToastService): boolean {
    if (Capacitor.getPlatform() !== 'android') {
      toastService.warning('La función de llamada solo está disponible en Android');
      return false;
    }
    return true;
  }

  static generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}