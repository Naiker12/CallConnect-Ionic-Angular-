import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from '@angular/fire/firestore';
import { Contact } from 'src/app/core/models/contact';

@Injectable({ providedIn: 'root' })
export class FirebaseContactService {
  constructor(
    private firestore: Firestore,
    private zone: NgZone 
  ) {}

  /**
   * Obtiene los contactos del usuario autenticado.
   * @param userId ID del usuario actual (dueño de la lista de contactos)
   */
  async getContacts(userId: string): Promise<Contact[]> {
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
   * Busca un usuario por número de teléfono dentro de la colección "users"
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
        telefono: data['telefono'] || '',
        foto: data['foto'] || 'assets/icon/icon_1200.webp'
      };
    } catch (error) {
      console.error('Error buscando usuario por teléfono:', error);
      return null;
    }
  }

  /**
   * Agrega un contacto al usuario actual en su subcolección de contactos
   * @param userId ID del usuario actual
   * @param contact Objeto del contacto a agregar
   */
  async addContact(userId: string, contact: Contact): Promise<void> {
    try {
      const contactRef = doc(this.firestore, `users/${userId}/contacts/${contact.uid}`);
      await setDoc(contactRef, contact);
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      throw error; 
    }
  }
}