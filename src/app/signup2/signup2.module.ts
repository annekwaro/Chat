import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Signup2PageRoutingModule } from './signup2-routing.module';

import { Signup2Page } from './signup2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Signup2PageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [Signup2Page],
})
export class Signup2PageModule {}
