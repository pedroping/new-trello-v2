export interface ICard {
  name: string;
  id: number;
  listId: number;
}

export interface ICardMoveEvent {
  id: number;
  element: HTMLElement;
  listId: number;
}
