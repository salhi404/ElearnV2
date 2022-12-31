import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  public sideBarEvent = new BehaviorSubject(-1);
  currentSideBarEvent = this.sideBarEvent.asObservable();
  public loggingEvent = new BehaviorSubject(-1);
  loggingStatusEvent = this.loggingEvent.asObservable();
  constructor() { }
  chngSideBarEvent(state: number) {
    this.sideBarEvent.next(state)
  }
  changeLoggingState(state: number) {
    this.loggingEvent.next(state)
  }
}
