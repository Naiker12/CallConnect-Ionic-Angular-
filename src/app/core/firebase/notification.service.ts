import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private firestore: Firestore) {}

  getTokenByUserId(userId: string): Observable<any> {
    const tokenRef = doc(this.firestore, `tokens/${userId}`);
    return docData(tokenRef);
  }
}
