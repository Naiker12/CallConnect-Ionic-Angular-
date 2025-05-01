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
  ) {}

  /**
   * Obtiene los contactos como Observable (nueva API Firestore)
   * @param userId ID del usuario actual
   */
  getContacts(userId: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, `users/${userId}/contacts`);
    return collectionData(contactsRef, { idField: 'uid' }) as Observable<Contact[]>;
  }
  /**
   * Obtiene los contactos (versión Promise)
   * @param userId ID del usuario actual
   */
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

  /**
   * Busca un usuario por número de teléfono
   * @param phone Número de teléfono a buscar
   */
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

  /**
   * Agrega un contacto
   * @param userId ID del usuario actual
   * @param contact Objeto del contacto a agregar
   */
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

  /**
   * Actualiza un contacto
   * @param userId ID del usuario actual
   * @param contactId ID del contacto a actualizar
   * @param contactData Datos parciales del contacto
   */
  async updateContact(userId: string, contactId: string, contactData: Partial<Contact>): Promise<void> {
    try {
      const contactRef = doc(this.firestore, `users/${userId}/contacts/${contactId}`);
      await updateDoc(contactRef, contactData);
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      throw error;
    }
  }
/**
 * Elimina un contacto
 * @param userId ID del usuario actual
 * @param contactId ID del contacto a eliminar
 */
  
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
/**
* Versión con Promise para eliminar contacto
*/
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