import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSenderService {
  private readonly apiUrl = 'https://ravishing-courtesy-production.up.railway.app/notifications';

  constructor(private http: HttpClient) {}

  sendIncomingCallNotification(data: {
    token: string,
    userId: string,
    meetingId: string,
    name: string,
    userFrom: string
  }) {
    const payload = {
      token: data.token,
      notification: {
        title: 'Llamada entrante',
        body: `${data.name} te está llamando`
      },
      android: {
        priority: 'high',
        data: {
          userId: data.userId,
          meetingId: data.meetingId,
          type: 'incoming_call',
          name: data.name,
          userFrom: data.userFrom
        }
      }
    };

    return this.http.post(this.apiUrl, payload);
  }
}
