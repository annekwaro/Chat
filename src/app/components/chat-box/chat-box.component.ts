import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
  @Input() chat: any; // expects { text, senderId, timestamp }
  @Input() current_user_id: string;

  isOwnMessage(): boolean {
    return this.chat?.senderId === this.current_user_id;
  }

  getMessageText(): string {
    return this.chat?.text || this.chat?.message;
  }

  getTime(): string {
    if (!this.chat?.timestamp) return '';
    if (this.chat.timestamp.toDate) {
      return this.chat.timestamp.toDate().toLocaleTimeString();
    }
    return new Date(this.chat.timestamp).toLocaleTimeString();
  }
}
