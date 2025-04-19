import { Contact } from 'src/app/core/models/contact';

/**
 * Interfaz que define las operaciones relacionadas con contactos.
 * Implementada por adaptadores como FirebaseContactRepository.
 */
export abstract class ContactRepository {
  
  /**
   * Obtiene todos los contactos del usuario autenticado.
   * @param userId ID del usuario autenticado
   * @returns Promesa que resuelve con una lista de contactos
   */
  abstract getContacts(userId: string): Promise<Contact[]>;

  /**
   * Busca un usuario por su número de teléfono.
   * @param phone Número de teléfono a buscar
   * @returns Promesa con el contacto encontrado o null
   */
  abstract searchUserByPhone(phone: string): Promise<Contact | null>;

  /**
   * Agrega un nuevo contacto al usuario autenticado.
   * @param userId ID del usuario autenticado
   * @param contact Contacto que se desea agregar
   * @returns Promesa vacía cuando la operación se completa correctamente
   */
  abstract addContact(userId: string, contact: Contact): Promise<void>;
}
