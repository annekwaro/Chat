import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, convertToParamMap, provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { firebaseFakes } from '../../../../testing/firebase-fakes';
import { AvatarComponent } from '../../../components/avatar/avatar.component';
import { ChatBoxComponent } from '../../../components/chat-box/chat-box.component';
import { ChatService } from '../../../services/chat/chat.service';
import { ChatPage, dayLabel, groupByDay } from './chat.page';

describe('ChatPage', () => {
  let component: ChatPage;
  let fixture: ComponentFixture<ChatPage>;

  async function setup(chatId = 'alice_bob', seed = true, blockedBy: string[] = []) {
    const fakes = firebaseFakes({ uid: 'alice' });
    if (seed) {
      fakes.firestore.data.set('chats/alice_bob', {
        participants: ['alice', 'bob'],
        participantNames: { alice: 'Alice', bob: 'Bob' },
        participantPhotos: {},
        lastMessage: 'Hey',
        lastSenderId: 'bob',
        lastUpdated: new Date(),
        readBy: {},
        blockedBy,
      });
      fakes.firestore.data.set('chats/alice_bob/messages/m1', { text: 'Hey', senderId: 'bob', timestamp: new Date() });
    }
    const params = convertToParamMap({ id: chatId });
    await TestBed.configureTestingModule({
      declarations: [ChatPage, ChatBoxComponent],
      imports: [IonicModule.forRoot(), FormsModule, RouterModule, AvatarComponent],
      providers: [
        ...fakes.providers,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: params }, paramMap: of(params) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fakes;
  }

  it('shows the other person and the messages', async () => {
    await setup();
    expect(component.state).toBe('ready');
    expect(component.otherName).toBe('Bob');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.person .name')?.textContent).toContain('Bob');
    expect(el.querySelectorAll('app-chat-box').length).toBe(1);
    expect(el.querySelector('.day-label')?.textContent).toContain('Aujourd’hui');
  });

  it('marks the chat as read when opened', async () => {
    const fakes = await setup();
    component.ionViewDidEnter();
    await new Promise((resolve) => setTimeout(resolve)); // let the write finish
    expect(fakes.firestore.data.get('chats/alice_bob')!['readBy']['alice']).toBeTruthy();
  });

  it('sends a message and clears the box', async () => {
    const fakes = await setup();
    component.text = 'Doing better today';
    await component.send();
    expect(component.text).toBe('');
    expect(fakes.firestore.data.get('chats/alice_bob')!['lastMessage']).toBe('Doing better today');
  });

  it('keeps the text if sending fails', async () => {
    await setup();
    spyOn(TestBed.inject(ChatService), 'sendMessage').and.rejectWith(new Error('offline'));
    component.text = 'Please keep me';
    await component.send();
    expect(component.text).toBe('Please keep me');
  });

  it('sends on Enter but not Shift+Enter', async () => {
    await setup();
    const send = spyOn(component, 'send');
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    expect(send).not.toHaveBeenCalled();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(send).toHaveBeenCalled();
  });

  it('says so when the chat does not exist', async () => {
    await setup('nope', false);
    expect(component.state).toBe('missing');
    expect(fixture.nativeElement.textContent).toContain('n’est pas disponible');
  });

  it('gives only the last message of a run the tail and their avatar', async () => {
    await setup();
    const t = new Date();
    const msgs = [
      { id: 'a', text: '1', senderId: 'bob', timestamp: t },
      { id: 'b', text: '2', senderId: 'bob', timestamp: t },
      { id: 'c', text: '3', senderId: 'alice', timestamp: t },
    ];
    expect(msgs.map((_, i) => component.endsRun(msgs, i))).toEqual([false, true, true]);
  });

  it('groups messages by day', () => {
    const now = new Date(2026, 9, 16, 12);
    const msg = (d: Date) => ({ text: 'x', senderId: 'a', timestamp: d });
    const groups = groupByDay(
      [msg(new Date(2026, 9, 15, 9)), msg(new Date(2026, 9, 16, 9)), msg(new Date(2026, 9, 16, 10))],
      now
    );
    expect(groups.map((g) => [g.label, g.messages.length])).toEqual([
      ['Hier', 1],
      ['Aujourd’hui', 2],
    ]);
    expect(dayLabel(new Date(2026, 9, 12), now)).toContain('12');
  });

  it('shows an unblock option instead of the message box when I blocked them', async () => {
    await setup('alice_bob', true, ['alice']);
    const el: HTMLElement = fixture.nativeElement;
    expect(component.canSend).toBeFalse();
    expect(el.querySelector('.compose')).toBeNull();
    expect(el.querySelector('.blocked-note')?.textContent).toContain('Vous avez bloqué Bob');
    expect(el.querySelector('.status')?.textContent).toContain('Bloqué');
  });

  it('tells the other person they can’t reply, without saying why', async () => {
    await setup('alice_bob', true, ['bob']);
    const note = fixture.nativeElement.querySelector('.blocked-note');
    expect(note.textContent).toContain('ne pouvez pas répondre');
    expect(note.querySelector('ion-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.status').textContent).not.toContain('Bloqué');
  });

  it('blocks from the menu', async () => {
    const fakes = await setup();
    await component.block();
    expect(fakes.firestore.data.get('chats/alice_bob')!['blockedBy']).toEqual(['alice']);
  });

  it('reports with the recent messages', async () => {
    const fakes = await setup();
    await component.report('spam');
    const key = [...fakes.firestore.data.keys()].find((k) => k.startsWith('reports/'))!;
    expect(fakes.firestore.data.get(key)!['messages'].map((m: any) => m.text)).toEqual(['Hey']);
  });

  it('shows a link to get help in a new chat', async () => {
    await setup();
    component.days = [];
    component.messageCount = 0;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.peer-note a')?.getAttribute('href')).toBe('/help');
  });
});
