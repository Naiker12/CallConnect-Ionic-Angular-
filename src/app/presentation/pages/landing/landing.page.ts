import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone : false
})
export class LandingPage {

  constructor(private router: Router) { }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}