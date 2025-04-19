import { Injectable } from '@angular/core';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  async requestPermissionAndGetToken(userId: string) {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Notifications no soportadas en este navegador');
      return;
    }

    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: 'BA7taex2yhg78S6zR2lbaQvr8a13SyTpbv1rJEbvyiPS4fZSzp8R7t1V3t_5flQY8Frf5ILMvw5NdYeJ0CCW5Fo'
      });

      if (token) {
        console.log('🔐 Token de FCM:', token);
      } else {
        console.log('⚠️ No se obtuvo el token');
      }
    } catch (err) {
      console.error('🚫 Error al obtener el token:', err);
    }
  }
}
