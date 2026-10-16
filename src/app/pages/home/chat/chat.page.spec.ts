import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { firebaseFakes } from '../../../../testing/firebase-fakes';
import { ChatBoxComponent } from '../../../components/chat-box/chat-box.component';
import { ChatPage } from './chat.page';

describe('ChatPage', () => {
  let component: ChatPage;
  let fixture: ComponentFixture<ChatPage>;

  beforeEach(async () => {
    const params = convertToParamMap({ id: 'chat-1' });
    await TestBed.configureTestingModule({
      declarations: [ChatPage, ChatBoxComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        ...firebaseFakes().providers,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: params, queryParamMap: convertToParamMap({}) }, queryParams: of({}), paramMap: of(params) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
