import { Component, OnInit,ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-msg-dd',
  templateUrl: './msg-dd.component.html',
  styleUrls: ['./msg-dd.component.scss']
})
export class MsgDDComponent implements OnInit {
  showMsgDD:boolean=false;
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
