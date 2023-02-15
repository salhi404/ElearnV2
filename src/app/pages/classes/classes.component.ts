import { Component , OnInit, OnDestroy} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent {
  oppenedtab:number=1;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  user: User = null as any;
  constructor(private events: EventsService,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription = this.events.userdataEvent.subscribe(
      state => {
        console.log("userdataEvent 11");
        if(state.state==1){
          this.user=state.userdata;
        }
        if(state.state==2){
          this.user=null as any;
        }
      }
    )
  }
  oppenTab(ind:number){
    this.oppenedtab=ind;
  }
}
