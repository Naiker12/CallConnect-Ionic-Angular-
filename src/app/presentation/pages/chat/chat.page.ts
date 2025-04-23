import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { Contact } from 'src/app/core/models/contact';
import { ContactService } from 'src/app/core/services/contact.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {
  contact: Contact | null = null;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private router: Router, 
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId?.() || null;
    const contactId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId && contactId) {
      this.loadContact(this.userId, contactId);
    }
  }

  loadContact(userId: string, contactId: string) {
    this.contactService.getContacts(userId).subscribe(contacts => {
      this.contact = contacts.find(c => c.uid === contactId) || null;
    });
  }

  async showOptions() {
    if (!this.contact) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del contacto',
      subHeader: this.contact.nombre,
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Actualizar contacto',
          icon: 'create-outline',
          handler: () => this.updateContact()
        },
        {
          text: 'Eliminar contacto',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deleteContact()
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  updateContact() {
    // Lógica para actualizar contacto
    console.log('Actualizar contacto:', this.contact);
  }

  deleteContact() {
    // Lógica para eliminar contacto
    console.log('Eliminar contacto:', this.contact);
  }

  goBack() {
    this.navCtrl.back();
  }

  goToCall() {
    if (this.router.url !== '/call') {
      this.router.navigate(['/call']);
    }
  }
}