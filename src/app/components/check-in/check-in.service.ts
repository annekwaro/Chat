import { Injectable } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { MoodEntry } from 'src/app/services/mood/mood.service';
import { CheckInComponent } from './check-in.component';

// Opens the daily check-in sheet; resolves true when a check-in was saved
@Injectable({ providedIn: 'root' })
export class CheckInService {
  constructor(private modals: ModalController, private toasts: ToastController) {}

  async open(entry: MoodEntry | null = null): Promise<boolean> {
    const modal = await this.modals.create({
      component: CheckInComponent,
      componentProps: { entry },
      // Full height so the Save button in the footer is on screen; swipe down to close
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'check-in-sheet',
    });
    await modal.present();
    const { role } = await modal.onDidDismiss();
    if (role === 'saved') {
      const toast = await this.toasts.create({ message: 'Check-in saved 💙', duration: 2000, position: 'top', color: 'dark' });
      await toast.present();
    }
    return role === 'saved';
  }
}
