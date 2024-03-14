import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,

    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'chat-app-376e6',
        appId: '1:381522455924:web:98098530c1f99f02c25021',
        storageBucket: 'chat-app-376e6.appspot.com',
        apiKey: 'AIzaSyDBKdTW5gp5SdpV7HDBSzwvtCcm-VqhmQM',
        authDomain: 'chat-app-376e6.firebaseapp.com',
        messagingSenderId: '381522455924',
        measurementId: 'G-2EHDQWK574',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
