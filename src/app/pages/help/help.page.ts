import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { EMERGENCY, FIND_A_HELPLINE, HELPLINES } from './helplines';

// "Need help now?": emergency number, helplines and a few grounding steps.
// Open to everyone, signed in or not.
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, TranslocoDirective],
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage {
  readonly emergency = EMERGENCY;
  readonly helplines = HELPLINES;
  readonly findAHelpline = FIND_A_HELPLINE;
}
