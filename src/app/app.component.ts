import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { FCMService } from './core/firebase/fcm.service';
import { HandleNotificationUseCase } from './domain/use-cases/send-notification.use-case';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private router: Router, private auth: Auth , 
    private fcm: FCMService, private handleNotification: HandleNotificationUseCase
  ) {
    
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });

    this.fcm.initFCM();
    // Escuchar notificaciones y redirigir al use case
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.handleNotification.execute(notification);
    });
  }
}
