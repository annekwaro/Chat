import { Component, OnInit } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {
  chatboxEllipsesOutline,
  heartOutline,
  homeOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  constructor() {
    addIcons({
      homeOutline,
      personOutline,
      heartOutline,
      chatboxEllipsesOutline,
      bookmark: 'bookmark',
      bookmarkOutline: 'bookmark-outline',
    });
  }

  ngOnInit() {}
}
