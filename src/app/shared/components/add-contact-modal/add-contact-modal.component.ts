import { Component } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc
} from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-add-contact-modal',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone: false
})
export class AddContactModalComponent {
  phoneNumber = '';

  constructor(
    private modalCtrl: ModalController,
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  async addContact() {
    const userId = this.authService.getUserId(); 
    if (!userId) {
      this.showAlert('Error', 'Usuario no autenticado');
      return;
    }

    if (!this.phoneNumber || !/^\d{7,15}$/.test(this.phoneNumber)) {
      this.showAlert('Número inválido', 'Ingresa un número de teléfono válido');
      return;
    }

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', this.phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      this.showAlert('Contacto no encontrado', 'Este número no está registrado en la app.');
      return;
    }

    const contactDoc = querySnapshot.docs[0];
    const contactData = contactDoc.data();
    const contactId = contactDoc.id;

  
    const contactRef = doc(this.firestore, `users/${userId}/contacts/${contactId}`);
    const existingContact = await getDoc(contactRef);
    if (existingContact.exists()) {
      this.showAlert('Ya agregado', 'Este contacto ya está en tu lista.');
      return;
    }


    await setDoc(contactRef, {
      name: contactData['name'] || 'Sin nombre',
      phone: this.phoneNumber,
      uid: contactId,
    });

    this.showToast('Contacto agregado exitosamente');
    this.modalCtrl.dismiss(true); 
  }

  cancel() {
    this.modalCtrl.dismiss(false); 
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }
}
