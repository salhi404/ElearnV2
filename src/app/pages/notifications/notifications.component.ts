import { Component , OnInit, OnDestroy, ViewChild, ElementRef, HostListener} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { StudentService } from "app/_services/student.service";
import { DatePipe } from '@angular/common';
import { UserService } from '../../_services/user.service';
 
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
  constructor(
    private events: EventsService,
    private StudentService:StudentService,
    private storageService: StorageService,
    private UserService:UserService) { }
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
    this.events.changenotificationsState({state:this.events.NOTIFREQUPDATE,data:null})
  }
  cancelNotif(ind:number){
    const uuid = this.notifications[ind].uuid;
    const notifId = this.notifications[ind].id;
    this.notifications.splice(ind,1);
    // FIXME spamming creates a conflict in the server  
    this.UserService.cancelnotification(uuid,notifId).subscribe({
      next:data=>{
        console.log("cancelnotification res : ",data);
        
        this.events.changenotificationsState({state:this.events.NOTIFUPDATE,data:{notifications:this.notifications}})
        
      },
      error:err=>{
        console.log("cancelnotification err : ",err);
      }
    })
  }
}
