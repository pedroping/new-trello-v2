import { IList } from './list.interfaces';

export interface IBoardEnvironmentData {
  id: number;
  name: string;
  lists: IList[];
}
