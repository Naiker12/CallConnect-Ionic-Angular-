// src/data/repositories/notification.repository.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationRepository {
  constructor(private http: HttpClient) {}

  sendNotification(notification: Notification) {
    return this.http.post(`${environment.firebaseConfig}/notifications/send`, notification);
  }
}
