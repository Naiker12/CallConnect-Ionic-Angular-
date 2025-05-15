import { Component } from '@angular/core';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone : false
})
export class LandingPage {

  constructor(private navService: NavigationService) { }

  goToLogin() {
    this.navService.goToLogin();
  }
}