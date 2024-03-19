import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { IonicSlides, PopoverController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { appsOutline, options } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import {
  IonCard,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonThumbnail,
  IonText,
  IonList,
} from '@ionic/angular/standalone';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
register();
@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonCard,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonIcon,
    IonThumbnail,
    IonText,
    CommonModule,
    RouterModule,
  ],
})
export class LandingPage implements OnInit {
  swiperModules = [IonicSlides];

  constructor() {
    addIcons({ appsOutline, options });
  }

  ngOnInit() {}
}
