import { Component, OnInit , OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit , OnDestroy{
  showSettingPanel:boolean=false;
  unoppenedchatCount:number=0;
  unoppenedMailCount:number=0;
  subscription: Subscription = new Subscription;
  TodayEventsCount:number=0;
  nextEvent:Date=null as any;
  datepipe: DatePipe = new DatePipe('en-US');
  constructor(private events: EventsService,) { }
  ngOnInit(): void {
    this.subscription=this.events.infostatusEvent.subscribe(state=>{
      console.log(state);
      if(state.unoppenedchatCount){
        this.unoppenedchatCount=state.unoppenedchatCount;
      }
      if(state.unoppenedMailCount){
        this.unoppenedMailCount=state.unoppenedMailCount;
      }
      this.TodayEventsCount=state.TodayEventsCount;
      this.nextEvent=state.nextEvent;
      
    })
  }
  isToday(date:Date):boolean{
    const todayDate = new Date();
  return !!(
    date.getDate() === todayDate.getDate() &&
    date.getMonth() === todayDate.getMonth() &&
    date.getFullYear() === todayDate.getFullYear()
  )
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
