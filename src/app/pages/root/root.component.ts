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
  showSettingPanel:boolean=false
  subscription: Subscription = new Subscription;
  showMiniSideBar:boolean=false;
  isTabletMode:boolean=false;
  DarkTheme:boolean=false;
  ngOnInit(): void {
    this.subscription =this.events.currentLayoutEvent.subscribe(state =>{
      switch (state) {
        case this.events.SIDEBARMINI:
          this.showMiniSideBar=!this.showMiniSideBar;
        break;
        case this.events.DARKTHEMELIGHT:
          this.DarkTheme=false;
        break;
        case this.events.DARKTHEMEDARK:
          this.DarkTheme=true;
        break;
      }
    } )
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if(window.innerWidth<=1024)this.isTabletMode=true;
    else this.isTabletMode=false;
    
    
  }

}
