import { Component, OnInit } from '@angular/core';
import { FcmService } from 'src/app/core/firebase/fcm.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
  standalone : false
})
export class CallPage implements OnInit {

  constructor(private fcmService: FcmService) {}

  async ngOnInit() {
    const userId = 'UCRIVPV0FRZjJCO8fXm2xlVDMGr2';
    this.fcmService.requestPermissionAndGetToken(userId);
  }
}
