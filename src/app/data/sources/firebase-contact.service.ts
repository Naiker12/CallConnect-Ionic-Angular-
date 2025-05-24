import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Contact } from 'src/app/core/models/contact';

@Injectable({
  providedIn: 'root'
})
export class FirebaseContactService {
  constructor(
    private firestore: Firestore
  ) { }

  getContacts(userId: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, `users/${userId}/contacts`);
    return collectionData(contactsRef, { idField: 'uid' }) as Observable<Contact[]>;
  }

  async getContactsPromise(userId: string): Promise<Contact[]> {
    try {
      const contactsRef = collection(this.firestore, `users/${userId}/contacts`);
      const snapshot = await getDocs(contactsRef);

      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      } as Contact));
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  }

  async searchUserByPhone(phone: string): Promise<Contact | null> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('telefono', '==', phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();

      return {
        uid: userDoc.id,
        nombre: data['nombre'] || '',
        telefono: data['telefono'] || phone,
        foto: data['foto'] || 'assets/icon/icon_1200.webp',
        ...data
      } as Contact;
    } catch (error) {
      console.error('Error buscando usuario por teléfono:', error);
      return null;
    }
  }

  async addContact(userId: string, contact: Contact): Promise<void> {
    try {
      const contactRef = doc(this.firestore, `users/${userId}/contacts/${contact.uid}`);
      await setDoc(contactRef, {
        ...contact,
        fechaCreacion: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      throw error;
    }
  }

  async updateContact(userId: string, contactId: string, contactData: Partial<Contact>): Promise<void> {
    try {
      const contactRef = doc(this.firestore, `users/${userId}/contacts/${contactId}`);
      await updateDoc(contactRef, contactData);
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      throw error;
    }
  }

  deleteContact(userId: string, contactId: string): Observable<void> {
    return new Observable<void>(observer => {
      (async () => {
        try {
          const contactRef = doc(this.firestore, `users/${userId}/contacts/${contactId}`);
          await deleteDoc(contactRef);
          observer.next();
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  async deleteContactPromise(userId: string, contactId: string): Promise<void> {
    try {
      const contactRef = doc(this.firestore, `users/${userId}/contacts/${contactId}`);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      throw error;
    }
  }
}