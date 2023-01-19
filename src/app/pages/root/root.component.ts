import { Component, OnInit,HostListener,OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from '../../_services/auth.service';
import { User } from 'src/app/Interfaces/user';
import { Subscription } from 'rxjs';
import {  Router, } from '@angular/router';
import { Mail } from 'src/app/Interfaces/Mail';
import { SocketioService } from 'src/app/services/socketio.service';
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
    private socketService:SocketioService,
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
  unoppenedMail:Mail[]=[];
  unoppenedMailCount:number=0
  showSettingPanel:boolean=false
  subscription: Subscription = new Subscription;
  subscription2: Subscription = new Subscription;
  showMiniSideBar:boolean=false;
  isTabletMode:boolean=false;
  DarkTheme:boolean=false;
  isLoggedIn = false;
  mailUpadte:number=-1;
  user:User=null as any;
  state:any={user:this.user,islogged:false,remember:true};
  userSent:boolean=false;
  ngOnInit(): void {
    //this.storageService.clearUser();
    this.onWindowResize();
    console.log("this.state");
    console.log(this.state);
    this.isLoggedIn=this.storageService.isLoggedIn();
    if(this.isLoggedIn){
      this.user=this.storageService.getUser();
    }
    if(this.state.islogged){
      this.isLoggedIn =this.state.islogged;
      this.user=this.state.user;
    }
    if( this.isLoggedIn){
      this.prepsubscription();
      this.socketService.setupSocketConnection(this.storageService.getTokent());
      this.socketService.getMsg();
      this.getMailUpdate();
      /*setInterval(() => {
        this.getMailUpdate();
      }, 12000);*/
      this.getnoppenedMail(); 
      
    }
    const pref=this.storageService.getPrefrences();
    this.DarkTheme=pref.darkTheme;
    this.showMiniSideBar=pref.miniSideBar;
    this.subscription2=this.events.loggingStatusEvent.subscribe(state=>{
      if(state==2){
        this.logout();
      }
    })
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
    
  }
  getMailUpdate(){
    this.authService.getMailUpdate().subscribe({
      next:mailUpdate=>{
        console.log(mailUpdate.code);
        if(this.mailUpadte==-1){
        this.mailUpadte=mailUpdate.code;
        console.log("mailUpdate.code"+mailUpdate.code);
        }else{
          if(this.mailUpadte!=mailUpdate.code){
            this.mailUpadte=mailUpdate.code;
            console.log("updated");
            this.events.changeUpdateState(1);
          }
        }
        
      },
      error:err=>{

      }
    })
  }
  getnoppenedMail(){
    this.authService.getUnoppenedMail().subscribe({
      next:data=>{
        console.log("UnoppenedMail");
        if(data.mails)this.unoppenedMail=data.mails;
        if(data.count)this.unoppenedMailCount=data.count;
      },
      error:err=>{

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
    this.subscription2.unsubscribe();
    if(!this.state.remember&&this.isLoggedIn)this.logout();
    this.socketService.disconnect();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if(window.innerWidth<=1024)this.isTabletMode=true;
    else this.isTabletMode=false;
  }

}
