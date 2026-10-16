import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { ChatRoom, ChatService, toDate } from './chat.service';

describe('ChatService', () => {
  function setup(uid: string | null = 'alice') {
    const fakes = firebaseFakes({ uid });
    TestBed.configureTestingModule({ providers: fakes.providers });
    fakes.firestore.data.set('users/alice', { uid: 'alice', name: 'Alice', email: 'a@x.com', photo: '' });
    fakes.firestore.data.set('users/bob', { uid: 'bob', name: 'Bob', email: 'b@x.com', photo: 'bob.png' });
    fakes.firestore.data.set('users/zed', { uid: 'zed', name: 'Zed', email: 'z@x.com' });
    return { service: TestBed.inject(ChatService), firestore: fakes.firestore };
  }

  const bob = { uid: 'bob', name: 'Bob', photo: 'bob.png' };

  it('lists everyone else, by name', async () => {
    const { service } = setup('bob');
    const users = await service.getUsers();
    expect(users.map((u) => u.name)).toEqual(['Alice', 'Zed']);
  });

  it('creates one chat per pair, sorted, with both names', async () => {
    const { service, firestore } = setup('zed');
    const id = await service.getOrCreateChatRoom({ uid: 'alice', name: 'Alice' });

    expect(id).toBe('alice_zed');
    const room = firestore.data.get('chats/alice_zed')!;
    expect(room['participants']).toEqual(['alice', 'zed']);
    expect(room['participantNames']).toEqual({ alice: 'Alice', zed: 'Zed' });
    // calling again reuses the same chat
    expect(await service.getOrCreateChatRoom({ uid: 'alice', name: 'Alice' })).toBe('alice_zed');
  });

  it('sends a message and updates the preview', async () => {
    const { service, firestore } = setup();
    const id = await service.getOrCreateChatRoom(bob);
    await service.sendMessage(id, '  Hi Bob  ');

    const messages = await firstValueFrom(service.watchMessages(id));
    expect(messages.map((m) => m.text)).toEqual(['Hi Bob']);
    expect(messages[0].timestamp instanceof Date).toBeTrue();
    const room = firestore.data.get(`chats/${id}`)!;
    expect(room['lastMessage']).toBe('Hi Bob');
    expect(room['lastSenderId']).toBe('alice');
    expect(room['readBy']['alice']).toEqual(room['lastUpdated']);
  });

  it('ignores empty messages and rejects very long ones', async () => {
    const { service, firestore } = setup();
    const id = await service.getOrCreateChatRoom(bob);
    await service.sendMessage(id, '   ');
    expect(firestore.data.get(`chats/${id}`)!['lastMessage']).toBeUndefined();
    await expectAsync(service.sendMessage(id, 'x'.repeat(2001))).toBeRejectedWithError('Message is too long');
  });

  it('refuses to send when logged out', async () => {
    const { service } = setup(null);
    await expectAsync(service.sendMessage('x', 'hi')).toBeRejectedWithError('Not logged in');
  });

  it('lists my chats, newest first', async () => {
    const { service, firestore } = setup();
    firestore.data.set('chats/alice_bob', { participants: ['alice', 'bob'], lastUpdated: new Date(2026, 0, 1) });
    firestore.data.set('chats/alice_zed', { participants: ['alice', 'zed'], lastUpdated: new Date(2026, 5, 1) });
    firestore.data.set('chats/bob_zed', { participants: ['bob', 'zed'], lastUpdated: new Date(2026, 9, 1) });

    const rooms = await firstValueFrom(service.watchChatRooms('alice'));
    expect(rooms.map((r) => r.id)).toEqual(['alice_zed', 'alice_bob']);
  });

  it('knows when a chat has a new message from the other person', () => {
    const { service } = setup();
    const room: ChatRoom = {
      participants: ['alice', 'bob'],
      participantNames: {},
      participantPhotos: {},
      lastSenderId: 'bob',
      lastUpdated: new Date(2026, 0, 2),
      readBy: { alice: new Date(2026, 0, 1) },
    };
    expect(service.isUnread(room, 'alice')).toBeTrue();
    expect(service.isUnread(room, 'bob')).toBeFalse(); // own message
    expect(service.isUnread({ ...room, readBy: { alice: new Date(2026, 0, 3) } }, 'alice')).toBeFalse();
  });

  it('marks a chat as read', async () => {
    const { service, firestore } = setup();
    const id = await service.getOrCreateChatRoom(bob);
    await service.markRead(id);
    expect(firestore.data.get(`chats/${id}`)!['readBy']['alice'] instanceof Date).toBeTrue();
  });

  it('converts Firestore timestamps to dates', () => {
    const date = new Date(2026, 0, 1);
    expect(toDate({ toDate: () => date })).toBe(date);
    expect(toDate(undefined)).toBeUndefined();
  });
});
