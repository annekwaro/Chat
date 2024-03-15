import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Signup2Page } from './signup2.page';

const routes: Routes = [
  {
    path: '',
    component: Signup2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Signup2PageRoutingModule {}
