import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  private messaging = getMessaging(initializeApp(environment.firebaseConfig));

  constructor(private http: HttpClient) {}

  async requestPermissionAndSaveToken(userId: string) {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebaseConfig.messagingSenderId
      });

      if (token) {
        console.log('Token FCM:', token);
        await this.http.post('https://ravishing-courtesy-production.up.railway.app/user/save-token', {
          userId,
          token
        }).toPromise();
      }

    } catch (error) {
      console.error(' Error al obtener el token:', error);
    }
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log(' Nueva notificación:', payload);
    });
  }
}
