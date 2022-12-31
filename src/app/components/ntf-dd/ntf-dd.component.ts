import { Component, OnInit,ElementRef, HostListener  } from '@angular/core';

@Component({
  selector: 'app-ntf-dd',
  templateUrl: './ntf-dd.component.html',
  styleUrls: ['./ntf-dd.component.scss']
})
export class NtfDDComponent implements OnInit {
  showNntDD:boolean=false;
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log("clicked inside");
    } else {
      this.showNntDD=false;
      
    }
  }
  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

}
