import { TestBed } from '@angular/core/testing';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { ApiService } from './api.service';

describe('ApiService', () => {
  it('writes documents and reads collections with their ids', async () => {
    const fakes = firebaseFakes();
    TestBed.configureTestingModule({ providers: fakes.providers });
    const service = TestBed.inject(ApiService);

    await service.setDocument('things/one', { name: 'One' });

    expect(await service.getCollection('things')).toEqual([{ id: 'one', name: 'One' } as any]);
  });
});
