import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { provideAuth, getAuth } from '@angular/fire/auth';


import { provideFirebaseApp, initializeApp, setLogLevel } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { CoreModule } from './core/core.module';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthRepository } from './domain/repositories/auth-repository';
import { FirebaseAuthRepository } from './data/repositories/firebase-auth.repository';


@NgModule({
  declarations: [AppComponent],
  imports: [ BrowserModule, IonicModule.forRoot(), AppRoutingModule, CoreModule, HttpClientModule ],


  providers: [{ provide: RouteReuseStrategy , useClass: IonicRouteStrategy  },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: AuthRepository , useClass: FirebaseAuthRepository },
    
  ],

  bootstrap: [AppComponent],

})
export class AppModule {}
