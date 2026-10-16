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

  constructor(private auth: AuthService, private router: Router) {}

  // Returning visitors (guest or signed in) go straight into the app
  async ionViewWillEnter() {
    if (await this.auth.getCurrentUserId()) {
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  }
}
