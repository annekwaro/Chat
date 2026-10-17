import { Component, Input } from '@angular/core';
import { Message } from 'src/app/services/chat/chat.service';
import { LOCALE } from 'src/app/locale';

// One message bubble: mine on the right in blue, theirs on the left in white
@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
  @Input() message!: Message;
  @Input() mine = false;
  @Input() tail = true; // false for a message followed by another from the same person

  get time(): string {
    return this.message?.timestamp
      ? this.message.timestamp.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
      : '';
  }
}
