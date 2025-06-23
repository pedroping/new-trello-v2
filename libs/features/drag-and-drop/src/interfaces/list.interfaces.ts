import { ICard } from './card.interfaces';

export interface IList {
  name: string;
  id: number;
  environmentId: number;
  cards: ICard[];
}

export const LIST_GAP = 15;

export interface ListElements {
  listElementRef: HTMLElement;
  ulElement: HTMLElement;
}
