import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { PluralPipe } from 'src/app/i18n/i18n';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule, AvatarComponent, TranslocoDirective, PluralPipe],
  declarations: [HomePage],
})
export class HomePageModule {}
