import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, IonicSlides } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { AuthService } from '../../services/auth/auth.service';

register();

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, RouterModule],
})
export class LandingPage {
  swiperModules = [IonicSlides];

  readonly slides = [
    {
      image: 'assets/imgs/image36.png',
      tint: '#e4edff',
      title: 'Check in with yourself',
      text: 'Log how you feel in a few taps and watch your mood over time.',
    },
    {
      image: 'assets/imgs/image37.png',
      tint: '#ffe9ef',
      title: 'Talk things through',
      text: 'Chat one-to-one with people in the community, whenever you need.',
    },
    {
      image: 'assets/imgs/image38.png',
      tint: '#e3f6e8',
      title: 'Find your calm',
      text: 'Breathing, a daily routine and guides to understand your mind.',
    },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  // Returning visitors (guest or signed in) go straight into the app
  async ionViewWillEnter() {
    if (await this.auth.getCurrentUserId()) {
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  }
}
