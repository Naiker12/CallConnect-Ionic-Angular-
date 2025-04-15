import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { MessagingService } from './messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private router: Router, private auth: Auth , 
    private messagingService: MessagingService
  ) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigateByUrl('/home', { replaceUrl: true });

        //  Solicitar permisos y registrar token
        this.messagingService.requestPermissionAndSaveToken(user.uid);
        this.messagingService.listenForMessages();

      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}




