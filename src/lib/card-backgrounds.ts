import data from './card-backgrounds.json';

export type CardBackground = {
  id: string;
  url: string;
  hint: string;
};

export const CardBackgrounds: CardBackground[] = data.cardBackgrounds;
