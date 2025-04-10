import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerificationModalComponent } from './components/verification-modal/verification-modal.component';

 const MODULOS = [CommonModule , FormsModule, IonicModule, ReactiveFormsModule];
 const COMPONENTES = [BackButtonComponent , VerificationModalComponent];



@NgModule({
  declarations: [...COMPONENTES],
  imports: [
     ...MODULOS
  ],
  exports : [...COMPONENTES , ...MODULOS]
})


export class SharedModule { }
