// menu.service.ts
import { Injectable } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { createAnimation } from '@ionic/core';
import { SideMenuComponent } from 'src/app/shared/components/side-menu/side-menu.component';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  async openSideMenu(): Promise<void> {
    try {
      const modal = await this.modalCtrl.create({
        component: SideMenuComponent,
        cssClass: 'side-modal',
        enterAnimation: this.slideInAnimation,
        leaveAnimation: this.slideOutAnimation
      });

      await modal.present();
    } catch (error) {
      this.showErrorToast('No se pudo abrir el perfil');
    }
  }

  private slideInAnimation(baseEl: HTMLElement) {
    const root = baseEl.shadowRoot || baseEl;
    const backdrop = root.querySelector('ion-backdrop');
    const wrapper = root.querySelector('.modal-wrapper') as HTMLElement;

    if (!backdrop || !wrapper) {
      return createAnimation();
    }

    const backdropAnimation = createAnimation()
      .addElement(backdrop)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(wrapper)
      .beforeStyles({
        'transform': 'translateX(-100%)',
        'opacity': '1'
      })
      .fromTo('transform', 'translateX(-100%)', 'translateX(0)');

    return createAnimation()
      .addElement(baseEl)
      .easing('cubic-bezier(0.36,0.66,0.04,1)')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  private slideOutAnimation(baseEl: HTMLElement) {
    const root = baseEl.shadowRoot || baseEl;
    const wrapper = root.querySelector('.modal-wrapper') as HTMLElement;

    if (!wrapper) {
      return createAnimation();
    }

    return createAnimation()
      .addElement(wrapper)
      .fromTo('transform', 'translateX(0)', 'translateX(-100%)')
      .easing('cubic-bezier(0.36,0.66,0.04,1)')
      .duration(300);
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}