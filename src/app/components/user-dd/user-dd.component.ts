import { Component, OnInit,ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-user-dd',
  templateUrl: './user-dd.component.html',
  styleUrls: ['./user-dd.component.scss']
})
export class UserDDComponent implements OnInit {
  showuserDD:boolean=false;
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log("clicked inside");
    } else {
      this.showuserDD=false;
      
    }
  }
  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

}
