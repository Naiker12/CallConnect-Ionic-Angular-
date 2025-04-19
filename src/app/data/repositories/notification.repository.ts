// src/data/repositories/notification.repository.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationRepository {
  constructor(private http: HttpClient) {}

<<<<<<< HEAD
=======
  


>>>>>>> 3be7a7f6861f1a9e0eee40380a97a7df1ad48277
  sendNotification(notification: Notification) {
    return this.http.post(`${environment.firebaseConfig}/notifications/send`, notification);
  }
}
