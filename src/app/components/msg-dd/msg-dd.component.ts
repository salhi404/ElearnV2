import { Component, OnInit,ElementRef, HostListener, Input } from '@angular/core';
import { Mail } from 'src/app/Interfaces/Mail';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-msg-dd',
  templateUrl: './msg-dd.component.html',
  styleUrls: ['./msg-dd.component.scss']
})
export class MsgDDComponent implements OnInit {
  @Input() mails:Mail[]=[];
  @Input() mailCount:number=0;
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
  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

}
