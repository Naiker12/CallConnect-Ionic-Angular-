import { Injectable } from '@angular/core';
import { ContactRepository } from '../repositories/contact-repository';
import { Contact } from 'src/app/core/models/contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private contactRepository: ContactRepository) {}

  /**
   * Obtiene los contactos de un usuario.
   * @param userId ID del usuario
   * @returns Promesa con la lista de contactos
   */
  getContacts(userId: string): Promise<Contact[]> {
    return this.contactRepository.getContacts(userId);
  }

  /**
   * Busca un contacto por número de teléfono y lo agrega a la lista de contactos del usuario.
   * @param userId ID del usuario que agrega el contacto
   * @param phone Teléfono del contacto a buscar
   * @throws Error si el contacto no se encuentra
   */
  async addContactByPhone(userId: string, phone: string): Promise<void> {
    const contact = await this.contactRepository.searchUserByPhone(phone);
    if (!contact) {
      console.warn(`Contacto con teléfono ${phone} no encontrado.`);
      throw new Error('El contacto no existe');
    }

    await this.contactRepository.addContact(userId, contact);
  }
}
