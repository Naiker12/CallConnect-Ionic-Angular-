import { Component, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone : false
})
export class SideMenuComponent {
  @Output() menuItemClicked = new EventEmitter<string>();

  constructor(private modalCtrl: ModalController) {}

  selectItem(item: string) {
    this.menuItemClicked.emit(item);
    this.closeMenu();
  }

  async closeMenu() {
    await this.modalCtrl.dismiss();
  }
}