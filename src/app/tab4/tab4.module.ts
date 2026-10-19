import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { PluralPipe } from '../i18n/i18n';

import { Tab4PageRoutingModule } from './tab4-routing.module';

import { Tab4Page } from './tab4.page';
import { MoodFaceComponent } from '../components/mood-face/mood-face.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
    MoodFaceComponent,
    TranslocoDirective,
    PluralPipe,
  ],
  declarations: [Tab4Page]
})
export class Tab4PageModule {}
