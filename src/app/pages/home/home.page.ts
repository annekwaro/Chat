import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('new_chat') modal: ModalController;
  @ViewChild('popover') popover: PopoverController;
  segment = 'chats';
  open_new_chat = false;
  users = [
    {
      id: 1,
      name: 'Anne',
      photo: 'https://i.pravatar.cc/300',
    },
    { id: 2, name: 'Robert', photo: 'https://i.pravatar.cc/301' },
    { id: 3, name: 'Michael', photo: 'https://i.pravatar.cc/303' },
    { id: 4, name: 'David', photo: 'https://i.pravatar.cc/304' },
    { id: 5, name: 'Richard', photo: 'https://i.pravatar.cc/305' },
  ];
  chatRooms = [
    { id: 1, name: 'Anne', photo: 'https://i.pravatar.cc/300' },
    { id: 2, name: 'Robert', photo: 'https://i.pravatar.cc/301' },
    { id: 3, name: 'Michael', photo: 'https://i.pravatar.cc/303' },
    { id: 4, name: 'David', photo: 'https://i.pravatar.cc/304' },
    { id: 5, name: 'Richard', photo: 'https://i.pravatar.cc/305' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  logout() {
    this.popover.dismiss();
  }

  onSegmentChanged(event: any) {
    console.log(event);
  }

  newChat() {
    this.open_new_chat = true;
  }

  onWillDismiss(event: any) {}

  cancel() {
    this.modal.dismiss();
    this.open_new_chat = false;
  }

  startChat(item) {}

  getChat(item) {
    this.router.navigate(['/', 'home', 'chats', item?.id]);
  }
}
