import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  public SIDEBARTAB=2;
  public SIDEBARMINI=3;
  public DARKTHEMELIGHT=4;
  public DARKTHEMEDARK=5;
  public layoutEvent = new BehaviorSubject(-1);
  currentLayoutEvent = this.layoutEvent.asObservable();
  public loggingEvent = new BehaviorSubject(-1);
  loggingStatusEvent = this.loggingEvent.asObservable();
  constructor() { }
  chngLayoutEvent(state: number) {
    this.layoutEvent.next(state)
  }
  changeLoggingState(state: number) {
    this.loggingEvent.next(state)
  }
}
