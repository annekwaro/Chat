import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chatId: string;
  messages: any[] = [];
  messageText: string = '';
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.auth.getId();
    console.log('ChatPage: chatId =', this.chatId);
    console.log('ChatPage: currentUserId =', this.currentUserId);

    if (this.chatId && this.currentUserId) {
      const collectionPath = `chats/${this.chatId}/messages`;
      console.log('Listening to collection:', collectionPath);
      this.afs
        .collection(collectionPath, (ref) => ref.orderBy('timestamp'))
        .valueChanges({ idField: 'id' })
        .subscribe((msgs) => {
          console.log('Messages received from Firestore:', msgs);
          this.messages = msgs;
        });
    } else {
      console.error('Missing chatId or userId');
    }
  }

  async sendMessage() {
    if (!this.messageText.trim()) return;
    console.log('Sending message to chatId:', this.chatId);
    try {
      await this.afs.collection(`chats/${this.chatId}/messages`).add({
        text: this.messageText,
        senderId: this.currentUserId,
        timestamp: new Date(),
      });
      console.log('Message sent');
      this.messageText = '';
    } catch (err) {
      console.error('Send error:', err);
    }
  }
}
