import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
  standalone : false
})
export class CallPage implements OnInit {
  contactName = 'Contacto de prueba';
  contactPhone = '';
  tipo = '';

  constructor(private alertController: AlertController, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.contactName = params['nombre'];
      this.contactPhone = params['telefono'];
      this.tipo = params['tipo'];
  
      if (this.tipo === 'voz') {
        this.startVoiceCall();
      }
    });
  }

  async startVoiceCall() {
    const alert = await this.alertController.create({
      header: 'Llamada de voz',
      message: 'Iniciando llamada de voz con ' + this.contactName,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async startVideoCall() {
    const alert = await this.alertController.create({
      header: 'Videollamada',
      message: 'Iniciando videollamada con ' + this.contactName,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
