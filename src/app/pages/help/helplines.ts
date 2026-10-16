// Crisis and support lines shown on the Help page.
// Please re-check these numbers with each service before launch, and add the
// countries your users are in. Numbers are dialled exactly as written in `tel`.
export interface Helpline {
  name: string;
  description: string;
  display: string; // how the number is shown
  tel: string; // what the phone dials
}

export const EMERGENCY = { display: '999 or 112', tel: '999' };

export const HELPLINES: Helpline[] = [
  {
    name: 'Kenya Red Cross',
    description: 'Free counselling and psychological first aid.',
    display: '1199',
    tel: '1199',
  },
  {
    name: 'Befrienders Kenya',
    description: 'Emotional support for anyone feeling distressed or suicidal.',
    display: '+254 722 178 177',
    tel: '+254722178177',
  },
  {
    name: 'Niskize',
    description: 'Confidential counselling by phone.',
    display: '0900 620 800',
    tel: '0900620800',
  },
];

// Finds a free, confidential helpline in almost any country
export const FIND_A_HELPLINE = 'https://findahelpline.com';
