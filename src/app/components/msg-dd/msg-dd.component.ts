import { Component, OnInit,ElementRef, HostListener, Input } from '@angular/core';
import { Mail } from 'src/app/Interfaces/Mail';
import { DatePipe } from '@angular/common';
import {  Router, NavigationExtras } from '@angular/router';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-msg-dd',
  templateUrl: './msg-dd.component.html',
  styleUrls: ['./msg-dd.component.scss']
})
export class MsgDDComponent implements OnInit {
  @Input() mails:Mail[]=[];
  @Input() mailCount:number=0;
  navigationExtras: NavigationExtras = { state: null as any };
  showMsgDD:boolean=false;
  datepipe: DatePipe = new DatePipe('en-US');
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
      //console.log("clicked inside");
    } else {
      this.showMsgDD=false;
      
    }
  }
  constructor(private eRef: ElementRef,private router: Router,private events:EventsService,) { }

  ngOnInit(): void {
  }
  open(ind:number){
    this.showMsgDD=false;
    if(this.router.url=="/email"){
      this.events.changeTaskState({task:this.events.TASKOPENMAIL,data:{mail:this.mails[ind]}})
    }else{
      console.log(this.mails[ind]);
      this.navigationExtras={ state: {openMail:true,mail:this.mails[ind]}  };
      this.router.navigate(["/email"],this.navigationExtras);
    }
    this.mailCount--;
    this.mails.splice(ind,1);
  }

}
