import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EventsService } from 'src/app/services/events.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    console.log(event);
}
  showuserDD:boolean=false;
  showNntDD:boolean=false;
  showMsgDD:boolean=false;
  isFullScreen=false;
  elem:any;
  constructor(
    @Inject(DOCUMENT) private document: any,
    private events:EventsService,
    ) { }
    ngOnInit(): void {
      this.chkScreenMode();
      this.elem = document.documentElement;
  }
  @HostListener('document:fullscreenchange', ['$event'])
     @HostListener('document:webkitfullscreenchange', ['$event'])
     @HostListener('document:mozfullscreenchange', ['$event'])
     @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenmodes(event:any){
        this.chkScreenMode();
      }
  chkScreenMode(){
        if(document.fullscreenElement){
          //fullscreen
          this.isFullScreen = true;
        }else{
          //not in full screen
          this.isFullScreen = false;
        }
      }
  openFullscreen() {
          if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
          } else if (this.elem.mozRequestFullScreen) {
            /* Firefox */
            this.elem.mozRequestFullScreen();
          } else if (this.elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            this.elem.webkitRequestFullscreen();
          } else if (this.elem.msRequestFullscreen) {
            /* IE/Edge */
            this.elem.msRequestFullscreen();
          }
        }
  /* Close fullscreen */
        closeFullscreen() {
          if (this.document.exitFullscreen) {
            this.document.exitFullscreen();
          } else if (this.document.mozCancelFullScreen) {
            /* Firefox */
            this.document.mozCancelFullScreen();
          } else if (this.document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            this.document.webkitExitFullscreen();
          } else if (this.document.msExitFullscreen) {
            /* IE/Edge */
            this.document.msExitFullscreen();
          }
        }
  unset(){
    this.showuserDD=false;
    this.showNntDD=false;
    this.showMsgDD=false;
  }
  toggeleSideBarShow(){
    console.log("toggeleSideBar trigger");
    
    this.events.chngSideBarEvent(2);
  }
  toggeleSideBarMini(){
    this.events.chngSideBarEvent(3);
  }
  toggeleDD(index:number){
    switch (index) {
      case 0:
        this.showuserDD=!this.showuserDD;
      break;
      case 1:
        this.showNntDD=!this.showNntDD;
      break;
      case 2:
      this.showMsgDD=!this.showMsgDD;
    break;
    }
  }
  toggleFullScreen(){
    this.chkScreenMode();
    if(!this.isFullScreen){
      this.openFullscreen();
      this.isFullScreen=true;
    }else{
      this.closeFullscreen();
      this.isFullScreen=false;
    }
  }

}
