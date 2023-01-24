import { Component, OnInit , OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';

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
      
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
