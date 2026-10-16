import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonModal, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatRoom, ChatService, ChatUser } from 'src/app/services/chat/chat.service';

export interface ChatPreview {
  room: ChatRoom;
  name: string;
  photo: string;
  preview: string;
  unread: boolean;
}

// "Today 10:04" shows as 10:04, this week as the weekday, older as a date
export function shortTime(date: Date | undefined, now = new Date()): string {
  if (!date) return '';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  const t = date.getTime();
  if (t >= startOfToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (t >= startOfToday - day) return 'Yesterday';
  if (t >= startOfToday - 6 * day) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('peopleSheet') peopleSheet?: IonModal;

  currentUserId: string | null = null;
  chats: ChatPreview[] = [];
  loading = true;
  error = '';
  query = '';

  // New chat sheet
  pickerOpen = false;
  users: ChatUser[] = [];
  usersLoading = false;
  userQuery = '';
  starting = false;

  private profiles = new Map<string, ChatUser>();
  private sub?: Subscription;

  constructor(
    private nav: NavController,
    private toast: ToastController,
    private auth: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.start();
  }

  // Tabs keep this page alive, so pick up a different account after logging out and back in
  async ionViewWillEnter() {
    if ((await this.auth.getCurrentUserId()) !== this.currentUserId) this.start();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async start() {
    this.sub?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.currentUserId = await this.auth.getCurrentUserId();
    if (!this.currentUserId) return;
    // Up-to-date names and photos; the chat document's copy is the fallback
    this.loadUsers();
    this.sub = this.chatService.watchChatRooms(this.currentUserId).subscribe({
      next: (rooms) => {
        this.chats = rooms.map((room) => this.toPreview(room));
        this.loading = false;
      },
      error: (err) => {
        console.error('Could not load chats', err);
        this.error = 'We couldn’t load your conversations. Check your connection and try again.';
        this.loading = false;
      },
    });
  }

  private toPreview(room: ChatRoom): ChatPreview {
    const otherId = this.chatService.otherParticipant(room, this.currentUserId);
    const profile = this.profiles.get(otherId);
    const mine = room.lastSenderId === this.currentUserId;
    return {
      room,
      name: profile?.name || room.participantNames[otherId] || 'Someone',
      photo: profile?.photo || room.participantPhotos[otherId] || '',
      preview: room.lastMessage ? (mine ? 'You: ' : '') + room.lastMessage : 'Say hello 👋',
      unread: this.chatService.isUnread(room, this.currentUserId),
    };
  }

  async loadUsers() {
    this.usersLoading = true;
    try {
      this.users = await this.chatService.getUsers();
      this.profiles = new Map(this.users.map((u) => [u.uid, u]));
      this.chats = this.chats.map((c) => this.toPreview(c.room));
    } catch (err) {
      console.error('Could not load people', err);
    } finally {
      this.usersLoading = false;
    }
  }

  get filteredChats(): ChatPreview[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.chats;
    return this.chats.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.room.lastMessage || '').toLowerCase().includes(q)
    );
  }

  get filteredUsers(): ChatUser[] {
    const q = this.userQuery.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(
      (u) => u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }

  get unreadCount(): number {
    return this.chats.filter((c) => c.unread).length;
  }

  time(room: ChatRoom): string {
    return shortTime(room.lastUpdated);
  }

  trackChat(_: number, chat: ChatPreview) {
    return chat.room.id;
  }

  openPicker() {
    this.userQuery = '';
    this.pickerOpen = true;
    if (!this.users.length) this.loadUsers();
  }

  async startChat(user: ChatUser) {
    if (this.starting) return;
    this.starting = true;
    try {
      const chatId = await this.chatService.getOrCreateChatRoom(user);
      // Close the sheet first: this page stays alive under the chat, and so would the sheet
      await this.peopleSheet?.dismiss();
      this.pickerOpen = false;
      this.nav.navigateForward(['/home/chats', chatId]);
    } catch (err) {
      console.error('Could not start chat', err);
      this.showToast('Couldn’t start the chat. Please try again.');
    } finally {
      this.starting = false;
    }
  }

  openChat(chat: ChatPreview) {
    this.nav.navigateForward(['/home/chats', chat.room.id]);
  }

  async handleRefresh(event: any) {
    await this.loadUsers();
    event.target.complete();
  }

  async logout() {
    this.sub?.unsubscribe();
    await this.auth.logout();
    this.currentUserId = null;
    this.chats = [];
    // navigateRoot clears the tabs from history so Back can't return to the chat list
    this.nav.navigateRoot('/landing');
  }

  private async showToast(message: string) {
    const toast = await this.toast.create({ message, duration: 2500, position: 'top' });
    await toast.present();
  }
}
