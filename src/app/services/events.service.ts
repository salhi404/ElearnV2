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
  public TASKOPENMODAL=2;//old 4
  public TASKGETCLASSES=3;  //old 15
  public TASKCHOOSECLASSES=4;  //old 10
  //public TASKUPDATECHOOSENCLASSES=5;  //old 10
  public TASKREFRESHCONNECTED=5;  //old 21
  public TASKCONNECTEDRECIEVED=6;  //old 20
  
  
  public UPDATEUSER=1;
  public DALETEUSER=2;
  public layoutEvent = new BehaviorSubject(-1);
  currentLayoutEvent = this.layoutEvent.asObservable();
  public chatEvent = new BehaviorSubject(-1);
  currentchatEvent = this.chatEvent.asObservable();
  public loggingEvent = new BehaviorSubject(-1);
  loggingStatusEvent = this.loggingEvent.asObservable();
  public infoEvent = new BehaviorSubject({unoppenedchatCount:0,unoppenedMailCount:0,TodayEventsCount:0,  nextEvent:null as any});
  infostatusEvent = this.infoEvent.asObservable();
  public modinfoEvent = new BehaviorSubject({usersCount:-1,connectedCount:-1/*,TodayEventsCount:0,  nextEvent:null as any*/});
  modinfostatusEvent = this.modinfoEvent.asObservable();
  public classinfoEvent = new BehaviorSubject({state:-1, classes:null});
  classinfostatusEvent = this.classinfoEvent.asObservable();
  public taskEvent = new BehaviorSubject({task:-1,data:{}as any});
  taskstatusEvent = this.taskEvent.asObservable();
  public updateEvent = new BehaviorSubject(-1);
  updatestatusEvent = this.updateEvent.asObservable();
  public userdataEvent = new BehaviorSubject<{state:number,userdata:any}>({state:-1,userdata:null});
  userdatastatusEvent = this.userdataEvent.asObservable();
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
  changeupdateState(state: any) {
    this.updateEvent.next(state);
  }
  changeuserdataState(state: {state:number,userdata:any}) {
    this.userdataEvent.next(state);
  }
  changemodInfoState(state: any) {
    this.modinfoEvent.next(state);
  }
  changeclassInfoState(state: any) {
    this.classinfoEvent.next(state);
  }
}
