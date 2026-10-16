import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const COLORS = ['#dbe7ff', '#ffe3ec', '#dff7e3', '#fff4cc', '#ece3ff', '#ffe8de'];

// Round profile picture, or the person's initials on a soft colour when there's no photo
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img *ngIf="showPhoto; else initialsTpl" [src]="photo" [alt]="name" (error)="failed = true" />
    <ng-template #initialsTpl>
      <span [style.background]="color" aria-hidden="true">{{ initials }}</span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        width: var(--size, 48px);
        height: var(--size, 48px);
        border-radius: 50%;
        overflow: hidden;
      }
      img,
      span {
        width: 100%;
        height: 100%;
      }
      img {
        object-fit: cover;
      }
      span {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: calc(var(--size, 48px) * 0.38);
        color: var(--ion-color-primary);
      }
    `,
  ],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() photo: string | null | undefined = '';
  failed = false;

  get showPhoto(): boolean {
    // pravatar.cc was a random stock photo given to every new account, not the person
    return !!this.photo && !this.failed && !this.photo.includes('pravatar.cc');
  }

  get initials(): string {
    const parts = (this.name || '').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '🙂';
  }

  get color(): string {
    let hash = 0;
    for (const ch of this.name || '') hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return COLORS[Math.abs(hash) % COLORS.length];
  }
}
