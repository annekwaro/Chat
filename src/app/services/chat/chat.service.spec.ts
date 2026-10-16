import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  function setup(uid: string | null = 'alice') {
    const fakes = firebaseFakes({ uid });
    TestBed.configureTestingModule({ providers: fakes.providers });
    return { service: TestBed.inject(ChatService), firestore: fakes.firestore };
  }

  it('creates one chat per pair of users, with a stable id', async () => {
    const { service, firestore } = setup('zed');
    const id = await service.getOrCreateChatRoom('alice', 'Alice', 'alice.png');

    expect(id).toBe('alice_zed');
    expect(firestore.data.get('chats/alice_zed')).toEqual(
      jasmine.objectContaining({ participants: ['zed', 'alice'] })
    );
    // calling again reuses the same chat
    expect(await service.getOrCreateChatRoom('alice', 'Alice', 'alice.png')).toBe('alice_zed');
  });

  it('sends a message and updates the chat preview', async () => {
    const { service, firestore } = setup();
    const id = await service.getOrCreateChatRoom('bob', 'Bob', '');
    await service.sendMessage(id, 'Hi Bob');

    const messages = await firstValueFrom(service.getMessages(id));
    expect(messages.map((m) => m.text)).toContain('Hi Bob');
    expect(firestore.data.get(`chats/${id}`)?.['lastMessage']).toBe('Hi Bob');
  });

  it('refuses to send when logged out', async () => {
    const { service } = setup(null);
    await expectAsync(service.sendMessage('x', 'hi')).toBeRejectedWithError('Not logged in');
  });
});
