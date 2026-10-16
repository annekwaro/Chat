import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
  let component: ChatBoxComponent;
  let fixture: ComponentFixture<ChatBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatBoxComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatBoxComponent);
    component = fixture.componentInstance;
    component.message = { text: 'Hello\nthere', senderId: 'a', timestamp: new Date(2026, 0, 1, 9, 5) };
  });

  it('shows the text and marks my own messages', () => {
    component.mine = true;
    fixture.detectChanges();
    const bubble: HTMLElement = fixture.nativeElement.querySelector('.bubble');
    expect(bubble.classList).toContain('mine');
    expect(bubble.querySelector('.text')?.textContent).toBe('Hello\nthere');
    expect(component.time).toContain('05');
  });

  it('shows other people’s messages on the left', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.bubble').classList).not.toContain('mine');
  });
});
