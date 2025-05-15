import { Injectable } from '@angular/core';
import { ContactRepository } from '../repositories/contact-repository';
import { Contact } from 'src/app/core/models/contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private contactRepository: ContactRepository) {}

  getContacts(userId: string): Promise<Contact[]> {
    return this.contactRepository.getContacts(userId);
  }

  async addContactByPhone(userId: string, phone: string): Promise<void> {
    const contact = await this.contactRepository.searchUserByPhone(phone);
    if (!contact) {
      console.warn(`Contacto con teléfono ${phone} no encontrado.`);
      throw new Error('El contacto no existe');
    }

    await this.contactRepository.addContact(userId, contact);
  }
}
