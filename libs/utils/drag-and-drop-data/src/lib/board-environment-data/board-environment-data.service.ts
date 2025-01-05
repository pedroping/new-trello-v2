import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IBoardEnvironmentData } from '@new-trello-v2/types-interfaces';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentDataService {
  private boardEnvironment$ = new BehaviorSubject<IBoardEnvironmentData>(
    <IBoardEnvironmentData>{},
  );

  set boardEnvironment(data: Partial<IBoardEnvironmentData>) {
    this.boardEnvironment$.next({ ...this.boardEnvironment, ...data });
  }

  get boardEnvironment(): IBoardEnvironmentData {
    return this.boardEnvironment$.value;
  }

  get boardEnvironment$$() {
    return this.boardEnvironment$.asObservable();
  }
}
