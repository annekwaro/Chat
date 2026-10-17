import { TestBed } from '@angular/core/testing';
import { MOODS } from 'src/app/services/mood/mood.service';
import { MoodFaceComponent } from './mood-face.component';

describe('MoodFaceComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [MoodFaceComponent] }));

  function render(mood: any) {
    const fixture = TestBed.createComponent(MoodFaceComponent);
    fixture.componentInstance.mood = mood;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('draws the face in the mood’s colour, labelled for screen readers', () => {
    const el = render(MOODS[0]);
    expect(el.querySelector('circle')?.getAttribute('fill')).toBe(MOODS[0].color);
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('Super');
  });

  it('is a faint grey face when there is no check-in', () => {
    const el = render(null);
    expect(el.querySelector('circle')?.getAttribute('fill')).toBe('#e6e9f2');
    expect(el.querySelectorAll('.faint').length).toBe(1);
    expect(el.querySelectorAll('.ink').length).toBe(0);
  });

  it('has a different mouth for every mood', () => {
    const mouths = MOODS.map((m) => render(m).querySelector('path:last-of-type')?.getAttribute('d'));
    expect(new Set(mouths).size).toBe(MOODS.length);
  });
});
