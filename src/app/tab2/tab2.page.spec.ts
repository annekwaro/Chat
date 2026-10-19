import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { firebaseFakes } from '../../testing/firebase-fakes';
import { Tab2Page } from './tab2.page';

describe('Tab2Page (Explore)', () => {
  let fixture: ComponentFixture<Tab2Page>;
  let component: Tab2Page;
  let queryParams: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [Tab2Page, IonicModule.forRoot()],
      providers: [
        ...firebaseFakes().providers,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads the library with three featured sessions', () => {
    expect(component.filtered.length).toBe(10);
    expect(component.featured.length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.topic').length).toBe(6);
  });

  it('filters by topic and toggles the topic off again', () => {
    const sleep = component.topics.find((t) => t.id === 'sleep')!;
    component.selectTopic(sleep);
    expect(component.filtered.map((c) => component.title(c))).toEqual(['Se détendre avant de dormir']);

    component.selectTopic(sleep);
    expect(component.filtered.length).toBe(10);
  });

  it('combines format and search filters', () => {
    component.selectFormat('podcast');
    component.onSearch({ detail: { value: 'inquiétude' } });
    expect(component.filtered.map((c) => component.title(c))).toEqual(['Quand l’inquiétude prend le dessus']);
  });

  it('opens the session sheet from a Home link (?item=id)', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    queryParams.next(convertToParamMap({ item: '6' }));
    await fixture.whenStable();

    expect(component.title(component.selected!)).toBe('Se détendre avant de dormir');
    expect(navigate).toHaveBeenCalled(); // clears the link params
  });

  it('applies the format from a Home "Show all" link (?format=podcast)', async () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    queryParams.next(convertToParamMap({ format: 'podcast' }));
    await fixture.whenStable();

    expect(component.selectedFormat).toBe('podcast');
    expect(component.filtered.every((c) => c.format === 'podcast')).toBeTrue();
  });
});
