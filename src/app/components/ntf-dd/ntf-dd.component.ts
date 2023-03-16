import { Component, OnInit,ElementRef, HostListener  } from '@angular/core';
import { EventsService } from 'app/services/events.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-ntf-dd',
  templateUrl: './ntf-dd.component.html',
  styleUrls: ['./ntf-dd.component.scss']
})
export class NtfDDComponent implements OnInit {
  showNntDD:boolean=false;
  subscription1: Subscription = new Subscription();
  notifications: any[]=[] ;
  navigationExtras: NavigationExtras = { state: null as any };
  datepipe: DatePipe = new DatePipe('en-US');
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log("clicked inside");
    } else {
      this.showNntDD=false;
      
    }
  }
  constructor(private eRef: ElementRef,private events: EventsService,private router: Router,) { }
  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription1 = this.events.notificationsEvent.subscribe(
      state => {
        console.log("notificationsEvent ",state);
        if(state.state==this.events.NOTIFUPDATE){
          this.notifications=state.data.notifications.slice(0, 7) ;
        }
      }
    );
  }
openNotif(ind:number){
  this.navigationExtras = { state: { ind } };
  this.router.navigate(['/notifications'], this.navigationExtras);
  this.showNntDD=false;
}
}
