import { Injectable } from "@angular/core";
import { NotificationRepository } from "src/app/data/repositories/notification.repository";

// send-notification.use-case.ts
@Injectable({ providedIn: 'root' })
export class SendNotificationUseCase {
  constructor(private repo: NotificationRepository) {}

  execute(notification: Notification) {
    return this.repo.sendNotification(notification);
  }
}

// handle-notification.use-case.ts
@Injectable({ providedIn: 'root' })
export class HandleNotificationUseCase {
  constructor() {}

  execute(notificationData: any) {
    if (notificationData.data?.type === 'video-call') {
      // Aquí podrías abrir la sala de Jitsi
      console.log('Abrir llamada Jitsi con', notificationData.data.room);
    }
  }
}
