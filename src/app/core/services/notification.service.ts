import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Inject, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { doc, updateDoc, getFirestore, Firestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private db = getFirestore(initializeApp(environment.firebaseConfig));

  constructor(private navCtrl: NavController) {
    this.setupListeners(); 
  }

  async registerPush(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log('No es plataforma nativa, saliendo...');
      return;
    }
  
    try {
      console.log('Solicitando token FCM...');
      
      // Verifica permisos primero
      const permStatus = await PushNotifications.checkPermissions();
      console.log('Estado de permisos:', permStatus);
  
      if (permStatus.receive !== 'granted') {
        const newStatus = await PushNotifications.requestPermissions();
        console.log('Nuevo estado de permisos:', newStatus);
        if (newStatus.receive !== 'granted') {
          throw new Error('Permisos no concedidos');
        }
      }
  
      const { token } = await FirebaseMessaging.getToken();
      console.log('Token FCM obtenido:', token);
      
      if (!token) {
        throw new Error('Token vacío recibido');
      }
  
      await this.saveTokenToFirestore(userId, token);
      
    } catch (error) {
      console.error('Error completo en registerPush:', error);
    }
  }

  private setupListeners() {
 
    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('Notificación en primer plano:', event);
      this.handleNotification(event.notification.data);
    });


    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('Notificación en segundo plano:', event);
      this.handleNotification(event.notification.data);
    });
  }

  private handleNotification(data: any) {
    if (data?.meetingId && data?.name) {
      this.navCtrl.navigateForward(['/incoming-call'], {
        state: { 
          meetingId: data.meetingId, 
          callerName: data.name 
        },
      });
    }
  }

  private async saveTokenToFirestore(userId: string, token: string) {
    try {
      await updateDoc(doc(this.db, 'users', userId), { token });
      console.log('Token guardado correctamente');
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }
}