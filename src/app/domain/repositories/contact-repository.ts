import { Contact } from 'src/app/core/models/contact';

export abstract class ContactRepository {
  
  abstract getContacts(userId: string): Promise<Contact[]>;

  abstract searchUserByPhone(phone: string): Promise<Contact | null>;

  abstract addContact(userId: string, contact: Contact): Promise<void>;
  
}
