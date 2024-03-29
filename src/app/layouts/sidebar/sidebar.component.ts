import { Component, OnInit,Input,ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isTabletMode:boolean=false;
  @Input() unoppenedchatCount:number=0;
  @Input()showMiniSideBar:boolean=false;
  @Input()mainrole:number=-1;
  @Input()roles:string[]=[];
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
     // console.log("clicked inside");
    } else {
     //console.log("clicked outside");
     if(!this.blockOutside)
     this.toggleSideBarShow(false);
    }
  }
  toggleSideBarShow(show:boolean){
    this.sideBarShow=show;
  }
  activeDropDown:boolean[]=[]
  sideBarShow:boolean=false;
  blockOutside:boolean=false;
  subscription: Subscription = new Subscription;
  constructor(
    private eRef: ElementRef,
    private events:EventsService,
    public router: Router
    ) { }

  ngOnInit(): void {
    this.subscription =this.events.currentLayoutEvent.subscribe(state =>{
      if (state==2) {
          console.log("logging change recieed in sidebar "+state);
          this.blockOutside=true;
          setTimeout(() => {
            this.blockOutside=false;
          }, 200);
          this.sideBarShow=true;
      }
    } )

    for (let index = 0; index < 10; index++) {
      this.activeDropDown[index] = false;
      
    }
  }
  toggelDropDown(index:number){
    this.activeDropDown[index]=!this.activeDropDown[index]
  }
  openPage(ind:number){
    const urls=['/test','/whiteboard'];
    const url = window.location.origin+urls[ind];
    window.location.href = url;
    }
}
