import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CheckInService } from '../components/check-in/check-in.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage {
  constructor(private checkIn: CheckInService) {}

  openCheckIn() {
    this.checkIn.open();
  }
}
