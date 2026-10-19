// Crisis and support lines shown on the Help page.
// Please re-check these numbers with each service before launch, and add the
// countries your users are in. Numbers are dialled exactly as written in `tel`.
export interface Helpline {
  id: string; // name and description: helplines.<id> in the translations
  display: string; // how the number is shown
  tel: string; // what the phone dials
}

// 112 works across Europe; 15 is France's medical emergency number (SAMU)
export const EMERGENCY = { tel: '112' }; // shown as help.emergency

export const HELPLINES: Helpline[] = [
  {
    id: 'suicide',
    display: '3114',
    tel: '3114',
  },
  {
    id: 'sosAmitie',
    display: '09 72 39 40 50',
    tel: '+33972394050',
  },
  {
    id: 'filSante',
    display: '0 800 235 236',
    tel: '0800235236',
  },
];

// Finds a free, confidential helpline in almost any country
export const FIND_A_HELPLINE = 'https://findahelpline.com';
