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
import { currentLocale } from 'src/app/locale';
import { LanguageService } from 'src/app/i18n/language.service';

export interface MessageDay {
  date: Date; // the first message's time
  messages: Message[];
}

// "Today", "Yesterday", "Monday 12 October"
export function dayLabel(date: Date, now = new Date(), words = { today: 'Aujourd’hui', yesterday: 'Hier' }): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / (24 * 60 * 60 * 1000));
  if (days === 0) return words.today;
  if (days === 1) return words.yesterday;
  return date.toLocaleDateString(currentLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export function groupByDay(messages: Message[]): MessageDay[] {
  const groups: MessageDay[] = [];
  for (const message of messages) {
    const last = groups[groups.length - 1];
    if (last && last.date.toDateString() === message.timestamp.toDateString()) last.messages.push(message);
    else groups.push({ date: message.timestamp, messages: [message] });
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
    private nav: NavController,
    private language: LanguageService
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
          this.otherName = room.participantNames[otherId] || this.t('common.someone');
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

  dayTitle(day: MessageDay): string {
    return dayLabel(day.date, new Date(), { today: this.t('chat.today'), yesterday: this.t('chat.yesterday') });
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

  // Last of a run of messages from the same person: gets the bubble tail and their avatar
  endsRun(messages: Message[], i: number): boolean {
    return messages[i + 1]?.senderId !== messages[i].senderId;
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
    const name = this.otherName;
    const sheet = await this.actionSheets.create({
      header: this.otherName,
      buttons: [
        { text: this.t('chat.menu.getHelp'), icon: 'heart-outline', handler: () => this.openHelp() },
        { text: this.t('chat.menu.report', { name }), icon: 'flag-outline', handler: () => this.chooseReportReason() },
        this.blockedByMe
          ? { text: this.t('chat.menu.unblock', { name }), icon: 'lock-open-outline', handler: () => this.unblock() }
          : { text: this.t('chat.menu.block', { name }), icon: 'ban-outline', role: 'destructive', handler: () => this.confirmBlock() },
        { text: this.t('common.cancel'), role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  openHelp() {
    this.nav.navigateForward('/help');
  }

  async confirmBlock() {
    const alert = await this.alerts.create({
      header: this.t('chat.block.confirm', { name: this.otherName }),
      message: this.t('chat.block.message'),
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('chat.block.button'), role: 'destructive', handler: () => this.block() },
      ],
    });
    await alert.present();
  }

  async block() {
    if (!this.room) return;
    try {
      await this.chatService.setBlocked(this.room, true);
      this.showToast(this.t('chat.block.done', { name: this.otherName }), 'dark');
    } catch (err) {
      console.error('Block failed', err);
      this.showToast(this.t('chat.block.failed'));
    }
  }

  async unblock() {
    if (!this.room) return;
    try {
      await this.chatService.setBlocked(this.room, false);
      this.showToast(this.t('chat.block.undone', { name: this.otherName }), 'dark');
    } catch (err) {
      console.error('Unblock failed', err);
      this.showToast(this.t('chat.block.unblockFailed'));
    }
  }

  async chooseReportReason() {
    const sheet = await this.actionSheets.create({
      header: this.t('chat.report.why', { name: this.otherName }),
      subHeader: this.t('chat.report.confidential'),
      buttons: [
        ...REPORT_REASONS.map((r) => ({ text: this.t(`chat.reasons.${r}`), handler: () => this.report(r) })),
        { text: this.t('common.cancel'), role: 'cancel' },
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
      this.showToast(this.t('chat.report.failed'));
      return;
    }
    const followUp = await this.alerts.create({
      header: this.t('chat.report.thanks'),
      message:
        reason === 'risk'
          ? this.t('chat.report.reviewRisk')
          : this.blockedByMe
            ? this.t('chat.report.review')
            : this.t('chat.report.reviewBlock', { name: this.otherName }),
      buttons:
        reason === 'risk'
          ? [{ text: this.t('common.close'), role: 'cancel' }, { text: this.t('common.seeHelplines'), handler: () => this.openHelp() }]
          : this.blockedByMe
            ? [{ text: this.t('common.ok'), role: 'cancel' }]
            : [
                { text: this.t('common.notNow'), role: 'cancel' },
                { text: this.t('chat.block.button'), role: 'destructive', handler: () => this.block() },
              ],
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
      this.showToast(this.t('chat.sendFailed'));
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

  private t(key: string, params?: Record<string, any>): string {
    return this.language.translate(key, params);
  }

  private async showToast(message: string, color = 'danger') {
    const toast = await this.toast.create({ message, duration: 3000, position: 'top', color });
    await toast.present();
  }
}
