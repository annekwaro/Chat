import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { Mood } from 'src/app/services/mood/mood.service';

// Mouth shapes from awful (1) to great (5)
const MOUTHS: Record<number, string> = {
  1: 'M15 34 Q24 26 33 34',
  2: 'M16 33 Q24 28.5 32 33',
  3: 'M17 31 L31 31',
  4: 'M16 29 Q24 35 32 29',
  5: 'M14.5 27.5 Q24 39 33.5 27.5 Z',
};

// A simple round face in the mood's colour. A faint grey face when there's no mood yet.
// Size it with the --size CSS variable (default 40px).
@Component({
  selector: 'app-mood-face',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  template: `
    <svg viewBox="0 0 48 48" role="img" [attr.aria-label]="(mood ? 'moods.' + mood.key + '.label' : 'moods.none') | transloco">
      <circle cx="24" cy="24" r="23" [attr.fill]="mood?.color || '#e6e9f2'" />
      <ng-container *ngIf="mood">
        <circle cx="17" cy="20" r="2.6" class="ink" />
        <circle cx="31" cy="20" r="2.6" class="ink" />
        <path *ngIf="mood.score === 1" d="M12.5 16.5 L20 13.5 M35.5 16.5 L28 13.5" class="line" />
        <path [attr.d]="mouth" class="line" [class.filled]="mood.score === 5" />
      </ng-container>
      <ng-container *ngIf="!mood">
        <circle cx="17" cy="21" r="2.4" class="faint-ink" />
        <circle cx="31" cy="21" r="2.4" class="faint-ink" />
        <path d="M18 31 Q24 33 30 31" class="line faint" />
      </ng-container>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        width: var(--size, 40px);
        height: var(--size, 40px);
      }
      svg {
        width: 100%;
        height: 100%;
      }
      .ink {
        fill: #2d2a3e;
      }
      .line {
        fill: none;
        stroke: #2d2a3e;
        stroke-width: 2.6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .filled {
        fill: #2d2a3e;
      }
      .faint-ink {
        fill: #b4bbd0;
      }
      .line.faint {
        stroke: #b4bbd0;
      }
    `,
  ],
})
export class MoodFaceComponent {
  @Input() mood: Mood | null | undefined = null;

  get mouth(): string {
    return MOUTHS[this.mood?.score || 3];
  }
}
