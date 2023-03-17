import { Component, OnInit,ElementRef, HostListener  } from '@angular/core';
import { EventsService } from 'app/services/events.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { UserService } from '../../_services/user.service';

@Component({
  selector: 'app-ntf-dd',
  templateUrl: './ntf-dd.component.html',
  styleUrls: ['./ntf-dd.component.scss']
})
export class NtfDDComponent implements OnInit {
  showNntDD:boolean=false;
  subscription1: Subscription = new Subscription();
  notifications: any[]=[] ;
  newNotifsCount:number=0;
  navigationExtras: NavigationExtras = { state: null as any };
  datepipe: DatePipe = new DatePipe('en-US');
  newLastSeen:any[]=[];
  activatebell:boolean=false;
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log("clicked inside");
    } else {
      this.showNntDD=false;
      
    }
  }
  constructor(private eRef: ElementRef,private events: EventsService,private router: Router,private UserService:UserService) { }
  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription1 = this.events.notificationsEvent.subscribe(
      state => {
        console.log("notificationsEvent ",state);
        if(state.state==this.events.NOTIFUPDATE){
          this.notifications=state.data.notifications.slice(0, 7) ;
          this.newNotifsCount=state.data.newNotifs.length || 0;
          this.newLastSeen=state.data.newLastSeen;
          // state.data.lastseen
        }
        if(state.state==this.events.NOTIFNEW){
          this.newNotifsCount+=state.data.newNotifsent.length;
          this.activatebell=true;
          setTimeout(() => {
            this.activatebell=false;
          }, 4100);
          this.notifications=state.data.newNotifsent.concat(this.notifications);
          this.newLastSeen=state.data.newLastSeen;
        }
      }
    );
  }
openNotif(ind:number){
  this.navigationExtras = { state: { ind } };
  this.router.navigate(['/notifications'], this.navigationExtras);
  this.showNntDD=false;
  this.newNotifsCount=0;
}
markAsread(){
  console.log("update last seen to",this.newLastSeen);
  if(this.newLastSeen.length){
    this.UserService.updatlastseen(this.newLastSeen).subscribe({
      next:data=>{
        console.log("updatlastseen res : ",data);
        this.newNotifsCount=0;
      },
      error:err=>{
        console.log("updatlastseen err : ",err);
      }
    })
  }

}
}
