// Crisis and support lines shown on the Help page.
// Please re-check these numbers with each service before launch, and add the
// countries your users are in. Numbers are dialled exactly as written in `tel`.
export interface Helpline {
  name: string;
  description: string;
  display: string; // how the number is shown
  tel: string; // what the phone dials
}

// 112 works across Europe; 15 is France's medical emergency number (SAMU)
export const EMERGENCY = { display: '112 or 15', tel: '112' };

export const HELPLINES: Helpline[] = [
  {
    name: '3114: suicide prevention line',
    description: 'Free national line for anyone thinking about suicide, or worried about someone. 24/7.',
    display: '3114',
    tel: '3114',
  },
  {
    name: 'SOS Amitié',
    description: 'Someone to listen if you feel lonely, low or in distress. 24/7.',
    display: '09 72 39 40 50',
    tel: '+33972394050',
  },
  {
    name: 'Fil Santé Jeunes',
    description: 'Free and anonymous support for 12–25 year olds.',
    display: '0 800 235 236',
    tel: '0800235236',
  },
];

// Finds a free, confidential helpline in almost any country
export const FIND_A_HELPLINE = 'https://findahelpline.com';
