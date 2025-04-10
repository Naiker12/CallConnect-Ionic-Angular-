import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  standalone: false
})
export class BackButtonComponent implements OnInit {

  @Input() color: string = '#007bff';

  constructor(private navCtrl: NavController) {}

  ngOnInit(): void {
  }

  goBack() {
    this.navCtrl.back();
  }
}
