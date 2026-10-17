import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import {
  ChatRoom,
  ChatService,
  MAX_MESSAGE_LENGTH,
  Message,
  REPORT_REASONS,
  ReportReason,
} from 'src/app/services/chat/chat.service';

export interface MessageDay {
  label: string;
  messages: Message[];
}

// "Today", "Yesterday", "Monday 12 October"
export function dayLabel(date: Date, now = new Date()): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export function groupByDay(messages: Message[], now = new Date()): MessageDay[] {
  const groups: MessageDay[] = [];
  for (const message of messages) {
    const label = dayLabel(message.timestamp, now);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  }
  return groups;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content?: IonContent;

  readonly maxLength = MAX_MESSAGE_LENGTH;
  chatId = '';
  currentUserId: string | null = null;
  room?: ChatRoom;
  otherName = '';
  otherPhoto = '';
  days: MessageDay[] = [];
  messages: Message[] = [];
  messageCount = 0;
  text = '';
  sending = false;
  state: 'loading' | 'ready' | 'missing' | 'error' = 'loading';

  private visible = false;
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private chatService: ChatService,
    private toast: ToastController,
    private actionSheets: ActionSheetController,
    private alerts: AlertController,
    private nav: NavController
  ) {}

  async ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUserId = await this.auth.getCurrentUserId();

    this.subs.push(
      this.chatService.watchRoom(this.chatId).subscribe({
        next: (room) => {
          if (!room) {
            this.state = 'missing';
            return;
          }
          this.room = room;
          const otherId = this.chatService.otherParticipant(room, this.currentUserId);
          this.otherName = room.participantNames[otherId] || 'Someone';
          this.otherPhoto = room.participantPhotos[otherId] || '';
          if (this.state === 'loading') this.state = 'ready';
          this.markReadIfNeeded();
        },
        error: (err) => this.fail(err),
      }),
      this.chatService.watchMessages(this.chatId).subscribe({
        next: (messages) => {
          const isNew = messages.length > this.messageCount;
          const first = this.messageCount === 0;
          this.messageCount = messages.length;
          this.messages = messages;
          this.days = groupByDay(messages);
          if (isNew) this.scrollToBottom(first ? 0 : 300);
        },
        error: (err) => this.fail(err),
      })
    );
  }

  ionViewDidEnter() {
    this.visible = true;
    this.markReadIfNeeded();
  }

  ionViewWillLeave() {
    this.visible = false;
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // My most recent message, which gets a "Sent" / "Seen" label
  get lastMineId(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.isMine(this.messages[i])) return this.messages[i].id;
    }
    return undefined;
  }

  // Seen once the other person has opened the chat after it was sent
  seen(message: Message): boolean {
    if (!this.room) return false;
    const otherId = this.chatService.otherParticipant(this.room, this.currentUserId);
    const opened = this.room.readBy?.[otherId];
    return !!opened && opened >= message.timestamp;
  }

  isMine(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  trackMessage(_: number, message: Message) {
    return message.id;
  }

  get blocked(): boolean {
    return !!this.room && this.chatService.isBlocked(this.room);
  }

  get blockedByMe(): boolean {
    return !!this.room && this.chatService.blockedByMe(this.room, this.currentUserId);
  }

  get canSend(): boolean {
    return !!this.text.trim() && !this.sending && this.state === 'ready' && !this.blocked;
  }

  async openMenu() {
    const sheet = await this.actionSheets.create({
      header: this.otherName,
      buttons: [
        { text: 'Get help now', icon: 'heart-outline', handler: () => this.openHelp() },
        { text: `Report ${this.otherName}`, icon: 'flag-outline', handler: () => this.chooseReportReason() },
        this.blockedByMe
          ? { text: `Unblock ${this.otherName}`, icon: 'lock-open-outline', handler: () => this.unblock() }
          : { text: `Block ${this.otherName}`, icon: 'ban-outline', role: 'destructive', handler: () => this.confirmBlock() },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  openHelp() {
    this.nav.navigateForward('/help');
  }

  async confirmBlock() {
    const alert = await this.alerts.create({
      header: `Block ${this.otherName}?`,
      message: 'Neither of you will be able to send messages in this chat. You can unblock at any time.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Block', role: 'destructive', handler: () => this.block() },
      ],
    });
    await alert.present();
  }

  async block() {
    if (!this.room) return;
    try {
      await this.chatService.setBlocked(this.room, true);
      this.showToast(`${this.otherName} is blocked.`, 'dark');
    } catch (err) {
      console.error('Block failed', err);
      this.showToast('Couldn’t block right now. Please try again.');
    }
  }

  async unblock() {
    if (!this.room) return;
    try {
      await this.chatService.setBlocked(this.room, false);
      this.showToast(`${this.otherName} is unblocked.`, 'dark');
    } catch (err) {
      console.error('Unblock failed', err);
      this.showToast('Couldn’t unblock right now. Please try again.');
    }
  }

  async chooseReportReason() {
    const sheet = await this.actionSheets.create({
      header: `Why are you reporting ${this.otherName}?`,
      subHeader: 'Your report is private. They won’t be told who sent it.',
      buttons: [
        ...REPORT_REASONS.map((r) => ({ text: r.label, handler: () => this.report(r.value) })),
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  async report(reason: ReportReason) {
    if (!this.room) return;
    try {
      await this.chatService.report(this.room, reason, this.messages);
    } catch (err) {
      console.error('Report failed', err);
      this.showToast('Couldn’t send the report. Please try again.');
      return;
    }
    const followUp = await this.alerts.create({
      header: 'Thanks for telling us',
      message:
        reason === 'risk'
          ? 'We’ll look at this. If someone is in danger right now, contact emergency services or a helpline.'
          : this.blockedByMe
            ? 'We’ll review this conversation.'
            : `We’ll review this conversation. Do you also want to block ${this.otherName}?`,
      buttons:
        reason === 'risk'
          ? [{ text: 'Close', role: 'cancel' }, { text: 'See helplines', handler: () => this.openHelp() }]
          : this.blockedByMe
            ? [{ text: 'OK', role: 'cancel' }]
            : [{ text: 'Not now', role: 'cancel' }, { text: 'Block', role: 'destructive', handler: () => this.block() }],
    });
    await followUp.present();
  }

  // Enter sends; Shift+Enter starts a new line
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  async send() {
    if (!this.canSend) return;
    const text = this.text;
    this.text = ''; // clear straight away so it feels instant
    this.sending = true;
    try {
      await this.chatService.sendMessage(this.chatId, text);
    } catch (err) {
      console.error('Send failed', err);
      this.text = text; // give the message back so nothing is lost
      this.showToast('Message not sent. Check your connection and try again.');
    } finally {
      this.sending = false;
    }
  }

  private markReadIfNeeded() {
    if (this.visible && this.room && this.chatService.isUnread(this.room, this.currentUserId)) {
      this.chatService.markRead(this.chatId).catch((err) => console.warn('Could not mark as read', err));
    }
  }

  private scrollToBottom(duration: number) {
    // wait for the new bubbles to render
    setTimeout(() => this.content?.scrollToBottom(duration), 50);
  }

  private fail(err: any) {
    console.error('Chat error', err);
    this.state = err?.code === 'permission-denied' ? 'missing' : 'error';
  }

  private async showToast(message: string, color = 'danger') {
    const toast = await this.toast.create({ message, duration: 3000, position: 'top', color });
    await toast.present();
  }
}
