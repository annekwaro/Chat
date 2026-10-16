import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firebaseFakes } from '../../../testing/firebase-fakes';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { HomePage } from './home.page';

describe('HomePage (Chat list)', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage, UserListComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [...firebaseFakes().providers, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
