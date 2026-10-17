import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { HomePage, shortTime } from './home.page';

describe('HomePage (Chat list)', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let nav: jasmine.SpyObj<NavController>;

  async function setup(seed: (data: Map<string, any>) => void = () => {}) {
    const fakes = firebaseFakes({ uid: 'alice' });
    fakes.firestore.data.set('users/alice', { uid: 'alice', name: 'Alice' });
    fakes.firestore.data.set('users/bob', { uid: 'bob', name: 'Bob Smith', photo: '' });
    seed(fakes.firestore.data);
    nav = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot']);
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), FormsModule, AvatarComponent],
      providers: [...fakes.providers, provideRouter([]), { provide: NavController, useValue: nav }],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fakes;
  }

  it('shows a friendly empty state with a way to start', async () => {
    await setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(component.loading).toBeFalse();
    expect(el.querySelector('.first-chat h2')?.textContent).toContain('Pas encore de conversation');
  });

  it('lists conversations with the other person’s name, preview and unread state', async () => {
    await setup((data) => {
      data.set('chats/alice_bob', {
        participants: ['alice', 'bob'],
        participantNames: { alice: 'Alice', bob: 'Bob' },
        participantPhotos: {},
        lastMessage: 'How are you?',
        lastSenderId: 'bob',
        lastUpdated: new Date(),
        readBy: {},
      });
    });
    expect(component.chats.length).toBe(1);
    const chat = component.chats[0];
    expect(chat.name).toBe('Bob Smith'); // fresh profile name beats the stored copy
    expect(chat.preview).toBe('How are you?');
    expect(chat.unread).toBeTrue();
    expect(component.unreadCount).toBe(1);

    const item: HTMLElement = fixture.nativeElement.querySelector('.chat-item');
    expect(item.classList).toContain('unread');
    item.click();
    expect(nav.navigateForward).toHaveBeenCalledWith(['/home/chats', 'alice_bob']);
  });

  it('prefixes my own last message with "You:"', async () => {
    await setup((data) => {
      data.set('chats/alice_bob', {
        participants: ['alice', 'bob'],
        lastMessage: 'See you',
        lastSenderId: 'alice',
        lastUpdated: new Date(),
      });
    });
    expect(component.chats[0].preview).toBe('Vous\u00a0: See you');
    expect(component.chats[0].unread).toBeFalse();
  });

  it('starts a chat from the people list', async () => {
    const fakes = await setup();
    component.openPicker();
    expect(component.users.map((u) => u.name)).toEqual(['Bob Smith']);
    await component.startChat(component.users[0]);
    expect(fakes.firestore.data.get('chats/alice_bob')).toBeTruthy();
    expect(nav.navigateForward).toHaveBeenCalledWith(['/home/chats', 'alice_bob']);
    expect(component.pickerOpen).toBeFalse();
  });

  it('filters people and conversations by search', async () => {
    await setup();
    component.userQuery = 'zzz';
    expect(component.filteredUsers).toEqual([]);
    component.userQuery = 'bob';
    expect(component.filteredUsers.length).toBe(1);
  });

  it('logs out back to the landing page', async () => {
    const fakes = await setup();
    await component.logout();
    expect(fakes.auth.logout).toHaveBeenCalled();
    expect(nav.navigateRoot).toHaveBeenCalledWith('/landing');
  });

  it('formats times like a messaging app', () => {
    const now = new Date(2026, 9, 16, 15, 0);
    expect(shortTime(new Date(2026, 9, 15, 9, 0), now)).toBe('Hier');
    expect(shortTime(new Date(2026, 9, 16, 9, 30), now)).toContain('30');
    expect(shortTime(undefined, now)).toBe('');
  });

  it('labels chats I blocked', async () => {
    await setup((data) => {
      data.set('chats/alice_bob', {
        participants: ['alice', 'bob'],
        lastMessage: 'Something unkind',
        lastSenderId: 'bob',
        lastUpdated: new Date(),
        blockedBy: ['alice'],
      });
    });
    expect(component.chats[0].preview).toBe('Bloqué');
  });
});
