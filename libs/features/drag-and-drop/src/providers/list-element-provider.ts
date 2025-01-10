import { InjectionToken } from '@angular/core';

interface ListElements {
  listElementRef: HTMLElement;
  ulElement: HTMLElement;
}

export const LIST_ELEMENT = new InjectionToken<ListElements>('LIST_ELEMENT');
