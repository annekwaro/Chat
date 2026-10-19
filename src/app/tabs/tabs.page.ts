import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { CheckInService } from '../components/check-in/check-in.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoDirective],
})
export class TabsPage {
  constructor(private checkIn: CheckInService) {}

  openCheckIn() {
    this.checkIn.open();
  }
}
