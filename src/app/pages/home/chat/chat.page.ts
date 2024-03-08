import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  name: string = 'sender';
  message: string;
  isLoading: boolean = false;
  currentUserId = 1;
  chats = [
    {
      id: 1,
      sender: 1,
      message: 'Hello how are you feeling?',
    },
    {
      id: 2,
      sender: 2,
      message: 'I am fine thank you, I just have some anxiety crisis today',
    },
  ];

  constructor() {}

  ngOnInit() {}

  sendMessage() {}
}
