import { Component , OnInit, OnDestroy, ViewChild, ElementRef, HostListener} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { StudentService } from "app/_services/student.service";
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent  implements OnInit, OnDestroy {
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  user: User = null as any;
  loading: boolean=false;
  datepipe: DatePipe = new DatePipe('en-US');
  loadingClasses: boolean=true;
  notifications: any[]=[] ;
  constructor(private events: EventsService,private StudentService:StudentService,private storageService: StorageService) { }
  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription1 = this.events.userdataEvent.subscribe(
      state => {
        console.log("userdataEvent 11");
        if(state.state==this.events.UPDATEUSER){
          this.user=state.userdata;
        }
        if(state.state==this.events.DALETEUSER){
          this.user=null as any;
        }
      }
    );
    this.subscription2 = this.events.notificationsEvent.subscribe(
      state => {
        console.log("notificationsEvent ",state);
        if(state.state==this.events.NOTIFUPDATE){
          this.notifications=state.data.notifications;
        }
      }
    );
  }

}
