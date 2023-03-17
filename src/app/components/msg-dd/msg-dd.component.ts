import { Component, OnInit,ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Mail } from 'app/Interfaces/Mail';
import { DatePipe } from '@angular/common';
import {  Router, NavigationExtras } from '@angular/router';
import { EventsService } from 'app/services/events.service';

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
  @ViewChild("MSGDD") MSGDD!: ElementRef;
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.MSGDD.nativeElement.contains(event.target)) {
      //console.log("clicked inside");
    } else {
      this.showMsgDD=false;
      
    }
  }
  constructor(private router: Router,private events:EventsService,) { }

  ngOnInit(): void {
  }
  open(ind:number){
    console.log("open email msg-dd : ",ind);
    
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
