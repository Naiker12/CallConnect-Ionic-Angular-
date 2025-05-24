import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
import { CoreModule } from './core/core.module';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthRepository } from './domain/repositories/auth-repository';
import { FirebaseAuthRepository } from './data/repositories/firebase-auth.repository';
import { NotificationService } from './core/firebase/notification.service';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';


// Inicialización única de Firebase
const firebaseApp = initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    CoreModule,
    HttpClientModule
  ],
  providers: [  
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { 
      provide: 'FIREBASE_APP', 
      useValue: firebaseApp 
    },
    { 
      provide: 'FIREBASE_AUTH', 
      useValue: getAuth(firebaseApp) 
    },
    { 
      provide: 'FIREBASE_FIRESTORE', 
      useValue: getFirestore(firebaseApp) 
    },
    { 
      provide: 'FIREBASE_MESSAGING',
      useFactory: () => {
        const messaging = getMessaging();
        return messaging;
      }
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    },
    { 
      provide: AuthRepository, 
      useClass: FirebaseAuthRepository 
    },
    NotificationService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}