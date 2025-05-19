import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading: HTMLIonLoadingElement | null = null;
  private defaultSpinner: string = 'crescent';

  constructor(private loadingCtrl: LoadingController) {}

  async show(
    message: string = 'Cargando...', 
    spinner: string | null = this.defaultSpinner
  ): Promise<void> {
    const validSpinners = ['bubbles', 'circles', 'circular', 'crescent', 'dots', 'lines', 'lines-small'];
    
    if (spinner && !validSpinners.includes(spinner)) {
      console.warn(`Spinner "${spinner}" no válido. Usando valor por defecto.`);
      spinner = this.defaultSpinner;
    }

    if (this.loading) {
      await this.hide();
    }

    this.loading = await this.loadingCtrl.create({
      message,
      spinner: spinner as any,
      translucent: true,
      backdropDismiss: false,
      cssClass: 'custom-loading'
    });

    await this.loading.present();
  }

  async hide(): Promise<boolean> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
      return true;
    }
    return false;
  }

  setDefaultSpinner(spinner: string): void {
    this.defaultSpinner = spinner;
  }
}