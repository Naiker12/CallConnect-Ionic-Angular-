import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CustomToastService {
  handleError(error: unknown) {
    throw new Error('Method not implemented.');
  }

  private defaultOptions = {
    duration: 3000,
    position: 'top' as const,
    cssClass: 'custom-toast',
    animated: true,
    mode: 'ios',
  };

  constructor(private toastController: ToastController) {}

  async showToast(options: {
    message: string;
    duration?: number;
    position?: 'top' | 'bottom' | 'middle';
    color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
    icon?: string;
    buttons?: any[];
    cssClass?: string | string[];
    header?: string;
    translucent?: boolean;
  }) {
    const toast = await this.toastController.create({
      ...this.defaultOptions,
      message: options.message,
      duration: options.duration || this.defaultOptions.duration,
      position: options.position || this.defaultOptions.position,
      color: options.color || 'primary',
      icon: options.icon,
      buttons: options.buttons,
      cssClass: this.addCustomClass(options.cssClass),
      header: options.header,
      translucent: options.translucent || false,
      mode: 'ios'
    });

    await toast.present();
    return toast;
  }
  async success(message: string, duration?: number, header?: string) {
    return this.showToast({
      message,
      duration,
      color: 'success',
      icon: 'checkmark-circle-outline',
      cssClass: 'success-toast',
      header
    });
  }

  async error(message: string, duration?: number, header?: string) {
    return this.showToast({
      message,
      duration,
      color: 'danger',
      icon: 'close-circle-outline',
      cssClass: 'error-toast',
      header
    });
  }

  async warning(message: string, duration?: number, header?: string) {
    return this.showToast({
      message,
      duration,
      color: 'warning',
      icon: 'warning-outline',
      cssClass: 'warning-toast',
      header
    });
  }

  async info(message: string, duration?: number, header?: string) {
    return this.showToast({
      message,
      duration,
      color: 'primary',
      icon: 'information-circle-outline',
      cssClass: 'info-toast',
      header
    });
  }

  async fancyToast(message: string, icon?: string) {
    return this.showToast({
      message,
      duration: 2500,
      color: 'dark',
      icon: icon || 'star-outline',
      cssClass: 'fancy-toast',
      translucent: true,
      position: 'top'
    });
  }

  private addCustomClass(customClass?: string | string[]): string[] {
    const baseClass = this.defaultOptions.cssClass;
    if (!customClass) return [baseClass];
    
    if (Array.isArray(customClass)) {
      return [baseClass, ...customClass];
    }
    
    return [baseClass, customClass];
  }
}