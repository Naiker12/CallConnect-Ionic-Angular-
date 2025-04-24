import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { MessagingService } from './messaging.service';
import { NotificationService } from './core/services/notification.service';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router,
    private auth: Auth,
    private messagingService: MessagingService,
    private notificationService: NotificationService  
  )
{
  this.platform.ready().then(() => {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
        this.notificationService.registerPush(user.uid);
        this.messagingService.requestPermissionAndSaveToken(user.uid);
        this.messagingService.listenForMessages();
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  });
}
}



