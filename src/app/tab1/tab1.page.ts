import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { appsOutline, options } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { JobComponent } from '../componentsb/job/job.component';
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
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
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
export class Tab1Page implements OnInit {
  swiperModules = [IonicSlides];

  popular: any[] = [];
  recent: any[] = [];

  constructor() {
    addIcons({ appsOutline, options });
  }

  ngOnInit() {
    this.popular = [
      {
        id: 1,
        duration: '12 minutes',
        location: 'New Delhi',
        expires_on: '30/11/23',
        description: 'How to be mindful',
        type: 'video',
        salary: '$40-90k/year',
        logo_dark: 'ct_dark.png',
        logo_light: 'ct_light.png',
      },
      {
        id: 2,
        duration: '10 minutes',
        location: 'Bangalore',
        expires_on: '07/12/23',
        description: 'Never be scared',
        type: 'video',
        salary: '$30-80k/year',
        logo_dark: 'uber_dark.png',
        logo_light: 'uber_light.png',
      },
      {
        id: 3,
        duration: '20 minutes',
        location: 'Mumbai',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'video',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 4,
        duration: '20 minutes',
        location: 'Grenoble',
        expires_on: '15/12/23',
        description: 'What to do',
        type: 'video',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
    ];
    this.recent = [
      {
        id: 4,
        duration: 'video',
        src: 'assets/imgs/image4.png',
        alt: 'Image 1',
        location: 'New Delhi',
        expires_on: '30/11/23',
        description: 'Emotional wheel',
        type: 'podcasts',
        salary: '$40-90k/year',
        logo_dark: 'tiktok_dark.png',
        logo_light: 'tiktok_light.png',
      },
      {
        id: 2,
        duration: 'podcast',
        src: 'assets/imgs/image5.png',
        alt: 'Image 1',
        location: 'Bangalore',
        expires_on: '07/12/23',
        description: 'Talk to someone',
        type: 'video',
        salary: '$30-80k/year',
        logo_dark: 'uber_dark.png',
        logo_light: 'uber_light.png',
      },
      {
        id: 3,
        duration: 'podcast',
        src: 'assets/imgs/image7.png',
        alt: 'Image 1',
        location: 'Mumbai',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'How do I cope with loss',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 5,
        duration: 'audio',
        location: 'Mumbai',
        src: 'assets/imgs/image6.png',
        alt: 'Image 1',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'podcasts',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 9,
        duration: 'audio',
        location: 'Mumbai',
        src: 'assets/imgs/image7.png',
        alt: 'Image 1',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'podcasts',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 10,
        duration: 'audio',
        location: 'Mumbai',
        src: 'assets/imgs/image5.png',
        alt: 'Image 1',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'podcasts',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 11,
        duration: 'audio',
        location: 'Mumbai',
        src: 'assets/imgs/image4.png',
        alt: 'Image 1',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'podcasts',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
      {
        id: 12,
        duration: 'audio',
        location: 'Mumbai',
        src: 'assets/imgs/image4.png',
        alt: 'Image 1',
        expires_on: '15/12/23',
        description: 'Sleeping with beauty',
        type: 'podcasts',
        salary: '$30-70k/year',
        logo_dark: 'linkedin_dark.png',
        logo_light: 'linkedin_light.png',
      },
    ];

    for (let i = 1; i < 1; i++) {
      this.recent.push(`Item ${i}`);
    }
  }
}
