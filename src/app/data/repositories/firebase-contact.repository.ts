import { Injectable } from '@angular/core';
import { ContactRepository } from 'src/app/domain/repositories/contact-repository';
import { FirebaseContactService } from '../sources/firebase-contact.service';
import { Contact } from 'src/app/core/models/contact';

@Injectable({ providedIn: 'root' })
export class FirebaseContactRepository implements ContactRepository {

  constructor(private firebaseContactService: FirebaseContactService) {}

  /**
   * Obtiene los contactos de un usuario específico
   * @param userId ID del usuario autenticado
   * @returns Promesa con la lista de contactos
   */
  getContacts(userId: string): Promise<Contact[]> {
    return this.firebaseContactService.getContacts(userId);
  }

  /**
   * Busca un usuario en Firebase por número de teléfono
   * @param phone Teléfono a buscar
   * @returns Promesa con el contacto encontrado o null
   */
  searchUserByPhone(phone: string): Promise<Contact | null> {
    return this.firebaseContactService.searchUserByPhone(phone);
  }

  /**
   * Agrega un contacto a la lista del usuario
   * @param userId ID del usuario que agrega el contacto
   * @param contact Contacto a agregar
   * @returns Promesa vacía cuando se complete correctamente
   */
  addContact(userId: string, contact: Contact): Promise<void> {
    return this.firebaseContactService.addContact(userId, contact);
  }
}
