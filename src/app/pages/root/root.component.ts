import { Component, OnInit,HostListener,OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from '../../_services/auth.service';
import { User } from 'src/app/Interfaces/user';
import { Subscription } from 'rxjs';
import {  Router, } from '@angular/router';
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
    private authService: AuthService,
    ) { 
        const navigation = this.router.getCurrentNavigation();
        this.state={user:this.user,islogged:false,remember:true};
        if(navigation){
          console.log("navigation zzzzzzzzzzzz");
          if(navigation.extras.state){
            this.state = navigation.extras.state as {
              user: User,
              islogged:boolean,
              remember:boolean,
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
  state:any={user:this.user,islogged:false,remember:true};
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
    const pref=this.storageService.getPrefrences();
    this.DarkTheme=pref.darkTheme;
    this.showMiniSideBar=pref.miniSideBar;
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
      this.storageService.setPrefrences({darkTheme:this.DarkTheme,miniSideBar:this.showMiniSideBar})
    } )
    this.subscription2=this.events.loggingStatusEvent.subscribe(state=>{
      if(state==2){
        this.logout();
      }
    })
  }
  logout(){
    this.authService.sendPref({darkTheme:this.DarkTheme,miniSideBar:this.showMiniSideBar}).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :"+err);
      //  this.loading=false;
      }
    });
    this.isLoggedIn=false;
    this.storageService.clearUser();
    this.user=null as any;
    this.events.changeLoggingState(-1);
  }
  test(){
    if(this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :"+err);
      //  this.loading=false;
      }
    });
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
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.storageService.setPrefrences({darkTheme:this.DarkTheme,miniSideBar:this.showMiniSideBar});
    if(this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :"+err);
      //  this.loading=false;
      }
    });
    this.subscription.unsubscribe();
    if(!this.state.remember&&this.isLoggedIn)this.logout();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if(window.innerWidth<=1024)this.isTabletMode=true;
    else this.isTabletMode=false;
    
    
  }

}
