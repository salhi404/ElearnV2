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
  public TASKOPENMAIL=1;
  public layoutEvent = new BehaviorSubject(-1);
  currentLayoutEvent = this.layoutEvent.asObservable();
  public chatEvent = new BehaviorSubject(-1);
  currentchatEvent = this.chatEvent.asObservable();
  public loggingEvent = new BehaviorSubject(-1);
  loggingStatusEvent = this.loggingEvent.asObservable();
  public infoEvent = new BehaviorSubject({unoppenedchatCount:0,unoppenedMailCount:0});
  infostatusEvent = this.infoEvent.asObservable();
  public taskEvent = new BehaviorSubject({task:-1,data:{}as any});
  taskstatusEvent = this.taskEvent.asObservable();
  constructor() { }
  chngLayoutEvent(state: number) {
    this.layoutEvent.next(state)
  }
  chngchatEvent(state: number) {
    this.chatEvent.next(state)
  }
  changeLoggingState(state: number) {
    this.loggingEvent.next(state)
  }
  changeInfoState(state: any) {
    this.infoEvent.next(state);
  }
  changeTaskState(state: any) {
    this.taskEvent.next(state);
  }
}
