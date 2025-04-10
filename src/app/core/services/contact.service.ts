import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private firestore: Firestore) {}

  getContacts(uid: string): Observable<any[]> {
    return collectionData(collection(this.firestore, `users/${uid}/contacts`), {
      idField: 'id'
    }) as Observable<any[]>;
  }
  
}
