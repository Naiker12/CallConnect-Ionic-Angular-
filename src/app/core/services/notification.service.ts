import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
<<<<<<< HEAD
import { NavController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private firestore: AngularFirestore , private Controller : NavController ) {}
=======

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private firestore: AngularFirestore) {}
>>>>>>> 3be7a7f6861f1a9e0eee40380a97a7df1ad48277

  async registerPush(userId: string) {
    if (Capacitor.isNativePlatform()) {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive !== 'granted') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('FCM Token:', token.value);
          await this.saveTokenToFirestore(userId, token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Registration error:', err);
        });
<<<<<<< HEAD

        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('Push notification received:', notification);

            const meetingId = notification.data?.meetingId;
            const name = notification.data?.name;
            // const user = this.auth.currentUser;

            // if (user != null) {
              if (meetingId && name) {
                this.Controller.navigateForward(['/incoming-call'], {
                  state: {
                    meetingId: meetingId,
                    callerName: name,
                  },
                });
              }
            }
          // },
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            console.log('Push notification action performed:', notification);
          },
        );
=======
>>>>>>> 3be7a7f6861f1a9e0eee40380a97a7df1ad48277
      }
    }
  }

  private saveTokenToFirestore(userId: string, token: string) {
    return this.firestore.collection('users').doc(userId).update({ token });
  }
<<<<<<< HEAD
  
=======
>>>>>>> 3be7a7f6861f1a9e0eee40380a97a7df1ad48277
}
