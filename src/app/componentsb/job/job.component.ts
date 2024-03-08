import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonThumbnail,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonText,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonCol,
  IonFooter,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons/dist/types/components/icon/utils';
import { bookmark } from 'ionicons/icons';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonCardTitle,
    IonCardContent,
    IonCardHeader,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonThumbnail,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonText,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonCol,
    IonFooter,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonContent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JobComponent implements OnInit {
  @Input() job: any;

  constructor() {
    addIcons({ bookmark });
  }

  ngOnInit() {}
}
