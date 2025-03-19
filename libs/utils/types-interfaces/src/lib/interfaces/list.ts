import { ICard } from './card';

export interface IList {
  cardName: string;
  listId: number;
  cards?: ICard[];
}
