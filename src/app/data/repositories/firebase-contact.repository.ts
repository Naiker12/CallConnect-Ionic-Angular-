import { Injectable } from '@angular/core';
import { ContactRepository } from 'src/app/domain/repositories/contact-repository';
import { FirebaseContactService } from '../sources/firebase-contact.service';
import { Contact } from 'src/app/core/models/contact';

@Injectable({ providedIn: 'root' })
export class FirebaseContactRepository implements ContactRepository {

  constructor(private firebaseContactService: FirebaseContactService) {}

  getContacts(userId: string): Promise<Contact[]> {
    return this.firebaseContactService.getContacts(userId);
  }

  searchUserByPhone(phone: string): Promise<Contact | null> {
    return this.firebaseContactService.searchUserByPhone(phone);
  }
  
  addContact(userId: string, contact: Contact): Promise<void> {
    return this.firebaseContactService.addContact(userId, contact);
  }
}
