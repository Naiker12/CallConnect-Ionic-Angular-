import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerificationModalComponent } from './components/verification-modal/verification-modal.component';
import { AddContactModalComponent } from './components/add-contact-modal/add-contact-modal.component';
import { ProfileComponent } from './components/profile/profile.component';


 const MODULOS = [CommonModule , FormsModule, IonicModule, ReactiveFormsModule ];
 const COMPONENTES = [BackButtonComponent , VerificationModalComponent , AddContactModalComponent , ProfileComponent ];



@NgModule({
  declarations: [...COMPONENTES],
  imports: [
     ...MODULOS
  ],
  exports : [...COMPONENTES , ...MODULOS]
})


export class SharedModule { }
