import { ICard } from './card.interfaces';

export interface IList {
  name: string;
  id: number;
  environmentId: number;
  cards: ICard[];
}
