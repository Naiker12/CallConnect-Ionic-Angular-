import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class HandleNotificationUseCase {
  constructor(private router: Router) {}

  execute(notification: any) {
    const type = notification.data?.type;
    const room = notification.data?.room;

    if (type === 'video-call' && room) {
      console.log('Redirigiendo a sala:', room);
      this.router.navigate(['/call', room]);
    }
  }
}
