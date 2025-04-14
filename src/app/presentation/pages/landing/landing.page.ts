import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone : false
})
export class LandingPage implements OnInit {
  
  showButton = false;
  countdown = 5;

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.showButton = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  goToLogin() {
    this.navCtrl.navigateForward('/login');
  }

}
