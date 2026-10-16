import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService, ChatRoom } from 'src/app/services/chat/chat.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  segment = 'chats';
  open_new_chat = false;
  users: any[] = [];
  chatRooms: ChatRoom[] = [];
  currentUserId: string | null = null;

  constructor(
    private router: Router,
    private popover: PopoverController,
    private auth: AuthService,
    private afs: AngularFirestore,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.currentUserId = await this.auth.getCurrentUserId();
    console.log('User ID:', this.currentUserId);
    // DO NOT LOAD ANYTHING – just test speed
  }

  async loadUsers() {
    if (!this.currentUserId) return;
    console.log('loadUsers: currentUserId =', this.currentUserId);
    try {
      const snapshot = await this.afs.collection('users').get().toPromise();
      console.log('Snapshot size:', snapshot.size);
      const allUsers = snapshot.docs.map((doc) => doc.data());
      console.log('All users:', allUsers);
      this.users = allUsers.filter((u: any) => u.uid !== this.currentUserId);
      console.log('Filtered users (others):', this.users);
      if (this.users.length === 0) {
        console.warn(
          'No other users found. Check that u.uid exists and matches Firebase Auth UIDs.'
        );
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  loadChatRooms() {
    if (!this.currentUserId) return;
    this.chatService.getUserChatRooms(this.currentUserId).subscribe((rooms) => {
      this.chatRooms = rooms;
    });
  }

  logout() {
    this.auth.logout();
    this.popover.dismiss();
    this.router.navigate(['/landing']);
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  newChat() {
    this.open_new_chat = true;
  }

  onWillDismiss(event: any) {
    this.open_new_chat = false;
  }

  cancel() {
    this.open_new_chat = false;
  }

  async startChat(user: any) {
    this.cancel();
    if (!this.currentUserId) return;
    const chatId = await this.chatService.getOrCreateChatRoom(
      user.uid,
      user.name,
      user.photo
    );
    this.router.navigate(['/home/chats', chatId], {
      queryParams: { name: user.name, photo: user.photo },
    });
  }

  getChat(room: ChatRoom) {
    if (!this.currentUserId) return;
    const otherId = room.participants.find((id) => id !== this.currentUserId);
    const name = room.participantNames?.[otherId] || 'Chat';
    const photo = room.participantPhotos?.[otherId] || '';
    this.router.navigate(['/home/chats', room.id], {
      queryParams: { name, photo },
    });
  }

  getOtherParticipant(room: ChatRoom): string {
    if (!this.currentUserId) return '';
    return room.participants.find((id) => id !== this.currentUserId) || '';
  }
}
