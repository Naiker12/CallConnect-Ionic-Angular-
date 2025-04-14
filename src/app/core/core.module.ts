import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from 'src/environments/environment';



// import { FcmService } from './firebase/fcm.service';
// import { NotificationService } from './services/notification.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    // NotificationService
  ],
})
export class CoreModule {}
