import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, IonicSlides } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageToggleComponent } from '../../components/language-toggle/language-toggle.component';
import { register } from 'swiper/element/bundle';
import { AuthService } from '../../services/auth/auth.service';

register();

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, RouterModule, TranslocoDirective, LanguageToggleComponent],
})
export class LandingPage {
  swiperModules = [IonicSlides];

  // Text: landing.slides.<id>
  readonly slides = [
    { id: 'checkIn', image: 'assets/imgs/image36.png', tint: '#e4edff' },
    { id: 'talk', image: 'assets/imgs/image37.png', tint: '#ffe9ef' },
    { id: 'calm', image: 'assets/imgs/image38.png', tint: '#e3f6e8' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  // Returning visitors (guest or signed in) go straight into the app
  async ionViewWillEnter() {
    if (await this.auth.getCurrentUserId()) {
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  }
}
