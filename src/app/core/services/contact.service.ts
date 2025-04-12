import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Contact } from 'src/app/core/models/contact';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  /**
   * Obtiene los contactos en tiempo real del usuario autenticado
   * @param uid ID del usuario autenticado
   * @returns Observable de la lista de contactos
   */
  getContacts(uid: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, `users/${uid}/contacts`) as CollectionReference<DocumentData>;
    return new Observable(observer => {
      this.ngZone.run(() => {
        const sub = collectionData(contactsRef, { idField: 'uid' }) as Observable<Contact[]>;
        sub.subscribe({
          next: data => observer.next(data),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      });
    });
  }
}
