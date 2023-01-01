import { Component, OnInit,HostListener,OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { StorageService } from 'src/app/_services/storage.service';
import { User } from 'src/app/Interfaces/user';
import { Subscription } from 'rxjs';
import {  Router, NavigationExtras, Navigation } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit ,OnDestroy {
  constructor(
    private router: Router,
    private events:EventsService,
    private storageService: StorageService, 
    ) { 
        const navigation = this.router.getCurrentNavigation();
        this.state={user:this.user,islogged:false};
        if(navigation){
          console.log("navigation zzzzzzzzzzzz");
          if(navigation.extras.state){
            this.state = navigation.extras.state as {
              user: User,
              islogged:boolean,
            };
          }
        }
    } 
  showSettingPanel:boolean=false
  subscription: Subscription = new Subscription;
  subscription2: Subscription = new Subscription;
  showMiniSideBar:boolean=false;
  isTabletMode:boolean=false;
  DarkTheme:boolean=false;
  isLoggedIn = false;
  user:User=null as any;
  state:any={user:this.user,islogged:false};
  userSent:boolean=false;
  ngOnInit(): void {
    console.log("this.state");
    console.log(this.state);
    if(this.state.islogged){
      this.isLoggedIn =this.state.islogged;
      this.user=this.state.user;
    }else{
      this.prepsubscription();
    }
    
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
    this.subscription2=this.events.loggingStatusEvent.subscribe(state=>{
      if(state==2){
        this.isLoggedIn=false;
        this.storageService.clean();
        this.user=null as any;
        this.events.changeLoggingState(-1);
      }
    })
  }
  prepsubscription(){
    console.log("prepsubscription : ");
    this.isLoggedIn = this.storageService.isLoggedIn();
  if (this.isLoggedIn) {
    this.user = this.storageService.getUser();
    console.log(this.user);
    /*this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
    this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
    */
  }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if(window.innerWidth<=1024)this.isTabletMode=true;
    else this.isTabletMode=false;
    
    
  }

}
