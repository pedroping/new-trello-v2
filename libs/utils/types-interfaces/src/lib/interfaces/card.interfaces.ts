export interface ICard {
  name: string;
  id: number;
  listId: number;
}

export interface IDragMoveEvent {
  id: number;
  element: HTMLElement;
  listId?: number;
  type: TEventType;
}

export interface IMoveEvent {
  x: number;
  y: number;
}

export type TEventType = 'card' | 'list';
