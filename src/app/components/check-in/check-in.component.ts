import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { COMPANY, MOODS, Mood, MoodEntry, MoodService } from 'src/app/services/mood/mood.service';
import { MoodFaceComponent } from '../mood-face/mood-face.component';

// Today's check-in: mood, who you were with, and an optional note.
// Opened as a bottom sheet from the "+" in the tab bar, Home and the Mood diary.
@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslocoDirective, MoodFaceComponent],
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent implements OnInit {
  // Today's entry if there is one, to edit it
  @Input() entry: MoodEntry | null = null;

  readonly moods = MOODS;
  readonly company = COMPANY;
  selected: Mood | null = null;
  withWhom = new Set<string>();
  note = '';
  saving = false;
  error = ''; // a translation key

  constructor(
    private modalCtrl: ModalController,
    private moodService: MoodService,
    private nav: NavController
  ) {}

  async ngOnInit() {
    if (!this.entry) {
      try {
        this.entry = await this.moodService.getToday();
      } catch {
        this.entry = null; // nothing saved yet, or offline: start empty
      }
    }
    this.selected = this.moodService.findMood(this.entry?.mood);
    this.withWhom = new Set(this.entry?.with || []);
    this.note = this.entry?.note || '';
  }

  toggleCompany(name: string) {
    if (this.withWhom.has(name)) this.withWhom.delete(name);
    else this.withWhom.add(name);
  }

  async save() {
    if (!this.selected || this.saving) return;
    this.saving = true;
    this.error = '';
    try {
      await this.moodService.setToday(this.selected, {
        with: this.company.filter((c) => this.withWhom.has(c)),
        note: this.note.trim(),
      });
      await this.modalCtrl.dismiss({ saved: true, mood: this.selected }, 'saved');
    } catch (err) {
      console.error('Could not save check-in', err);
      this.error = 'checkIn.saveFailed';
    } finally {
      this.saving = false;
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async getHelp() {
    await this.modalCtrl.dismiss(null, 'help');
    this.nav.navigateForward('/help');
  }
}
