// src/app/core/firebase/fcm.service.ts
import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotification, PushNotificationActionPerformed } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class FCMService {
  constructor() {}

  async initFCM() {
    // Solicitar permiso
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      await PushNotifications.register();
    }

    // Obtener token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
      // Aquí puedes guardar el token en Firestore o enviarlo al backend
    });

    // Error de registro
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ', error);
    });

    // Notificación recibida en foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('Push received: ', notification);
      // Puedes disparar un caso de uso aquí
    });

    // Notificación tocada
    PushNotifications.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
      console.log('Action performed: ', action.notification);
      // Ejemplo: abrir llamada Jitsi si viene con data.type === 'video-call'
    });
  }
}
