import { Component, OnInit,HostListener  } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
  constructor(private events:EventsService,) { }
  subscription: Subscription = new Subscription;
  showMiniSideBar:boolean=false;
  isTabletMode:boolean=false;
  ngOnInit(): void {
    this.subscription =this.events.currentSideBarEvent.subscribe(state =>{
      if (state==3) {
          console.log("logging change recieed in roooot state==3 "+state);
          this.showMiniSideBar=!this.showMiniSideBar;
      }
    } )
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if(window.innerWidth<=1024)this.isTabletMode=true;
    else this.isTabletMode=false;
    
    
  }

}
