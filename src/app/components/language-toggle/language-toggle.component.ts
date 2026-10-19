import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from 'src/app/i18n/language.service';

// Switches between French and English. Shows the language you'd switch to.
@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [IonicModule, TranslocoDirective],
  template: `
    <ion-button *transloco="let t" class="language" shape="round" [attr.aria-label]="t('language.switch')" (click)="language.toggle()">
      <ion-icon slot="start" name="globe-outline" aria-hidden="true"></ion-icon>
      {{ t('language.other') }}
    </ion-button>
  `,
  styles: [
    `
      .language {
        --padding-start: 10px;
        --padding-end: 12px;
        height: 36px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        --background: #ffffff;
        --color: var(--ion-color-primary);
        --box-shadow: 0 2px 10px rgba(5, 88, 231, 0.12);
      }
      ion-icon {
        font-size: 18px;
        margin-inline-end: 4px;
      }
    `,
  ],
})
export class LanguageToggleComponent {
  constructor(public language: LanguageService) {}
}
