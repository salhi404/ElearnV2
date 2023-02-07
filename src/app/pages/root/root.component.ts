import { Component, OnInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from '../../_services/auth.service';
import { User } from 'src/app/Interfaces/user';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Mail } from 'src/app/Interfaces/Mail';
import { SocketioService } from 'src/app/services/socketio.service';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit, OnDestroy {
  elementfooterHeight:number=0;
  currentRoute:number = 0;
  interfaceLayout:boolean = false;
  unoppenedchatCount: number=0;
  constructor(
    private router: Router,
    private events: EventsService,
    private storageService: StorageService,
    private authService: AuthService,
    private socketService: SocketioService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.state = { user: this.user, islogged: false, remember: true };
    if (navigation) {
      if (navigation.extras.state) {
        this.state = navigation.extras.state as {
          user: User,
          islogged: boolean,
          remember: boolean,
        };
      }
    }
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {

      if(!this.storageService.isLoggedIn()&&event.url!="/login"&&event.url!="/signup"){
        this.router.navigate(["/"]);
      }
      this.interfaceLayout=false;
      switch (event.url) {
        case "/":
          if(this.storageService.isLoggedIn())this.router.navigate(["/home"]);
          this.currentRoute=0;
          this.interfaceLayout=true;
          break;
        case "/home":
          this.currentRoute=1;
          this.getTodeyCalender();
          break;
        case "/email":
          this.currentRoute=2;
          break;
        case "/chat":
          this.currentRoute=3;
          break;
        case "/calendar":
        this.currentRoute=4;
        break;
        case "/profile":
        this.currentRoute=5;
        break;
        default:
          if(this.storageService.isLoggedIn())this.router.navigate(["/home"]);
          this.currentRoute=0;
          this.interfaceLayout=true;
        break
      } 
      console.log(event);
      console.log(this.currentRoute);

    });
  }
  width:number=0;
  height:number=0;
  unoppenedMail: Mail[] = [];
  unoppenedMailCount: number = 0;
  showSettingPanel: boolean = false
  subscription: Subscription = new Subscription;
  subscription2: Subscription = new Subscription;
  subscription3: Subscription = new Subscription;
  subscription4: Subscription = new Subscription;
  subscription5: Subscription = new Subscription;
  subscription6: Subscription = new Subscription;
  showMiniSideBar: boolean = false;
  isTabletMode: boolean = false;
  DarkTheme: boolean = false;
  isLoggedIn = false;
  mailUpadte: number = -1;
  user: User = null as any;
  state: any = { user: this.user, islogged: false, remember: true };
  userSent: boolean = false;
  ngOnInit(): void {
    this.onWindowResize();
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.storageService.getUser();
      this.authService.verifyJwt().subscribe({next:data=>{
        if(!data.verified)this.logout();
      },error:err=>{
        if(!err.verified)this.logout();
        
      }});
    }
    if (this.state.islogged) {
      this.isLoggedIn = this.state.islogged;
      this.user = this.state.user;
    }
    if (this.isLoggedIn) {
      console.log("user");
      console.log(this.user);
      this.prepsubscription();
      this.socketService.setupSocketConnection(this.storageService.getTokent());
      this.socketService.getMsg();
      //this.getMailUpdate();
      /*setInterval(() => {
        this.getMailUpdate();
      }, 12000);*/
      this.getnoppenedMail();
      this.getnoppenedchat();
      this.subscription3 = this.socketService.recieveMsg.subscribe(data => {
        if (data.code == 1) this.unoppenedchatCount++;
        var info=this.events.infoEvent.getValue();
        info.unoppenedchatCount=this.unoppenedchatCount;
        this.events.changeInfoState(info);
      });
      this.subscription4 = this.events.currentchatEvent.subscribe(state => {
        if (state >= 0) {
          this.unoppenedchatCount = state;
          var info=this.events.infoEvent.getValue();
          info.unoppenedchatCount=this.unoppenedchatCount;
          this.events.changeInfoState(info);
        }
      })
      this.subscription6 = this.events.updateEvent.subscribe(state => {
        if (state == this.events.UPDATEUSER) {
          this.user = this.storageService.getUser();
        }
      })
      this.subscription5=this.events.infostatusEvent.subscribe(state=>{
        console.log(state);
        if(state.unoppenedchatCount){
          this.unoppenedchatCount=state.unoppenedchatCount;
        }
        if(state.unoppenedMailCount){
          this.unoppenedMailCount=state.unoppenedMailCount;
        }
        
      })
    }
    const pref = this.storageService.getPrefrences();
    this.DarkTheme = pref.darkTheme;
    this.showMiniSideBar = pref.miniSideBar;
    this.subscription2 = this.events.loggingStatusEvent.subscribe(state => {
      if (state == 2) {
        this.logout();
      }
    })
    this.subscription = this.events.currentLayoutEvent.subscribe(state => {
      switch (state) {
        case this.events.SIDEBARMINI:
          this.showMiniSideBar = !this.showMiniSideBar;
          break;
        case this.events.DARKTHEMELIGHT:
          this.DarkTheme = false;
          break;
        case this.events.DARKTHEMEDARK:
          this.DarkTheme = true;
          break;
      }
      this.storageService.setPrefrences({ darkTheme: this.DarkTheme, miniSideBar: this.showMiniSideBar })
    })

  }
  /*getMailUpdate() {
    this.authService.getMailUpdate().subscribe({
      next: mailUpdate => {
        console.log(mailUpdate.code);
        if (this.mailUpadte == -1) {
          this.mailUpadte = mailUpdate.code;
          console.log("mailUpdate.code" + mailUpdate.code);
        } else {
          if (this.mailUpadte != mailUpdate.code) {
            this.mailUpadte = mailUpdate.code;
            console.log("updated");
            this.events.changeUpdateState(1);
          }
        }

      },
      error: err => {

      }
    })
  }*/
  getnoppenedMail() {
    this.authService.getUnoppenedMail().subscribe({
      next: data => {
        if (data.mails){
          this.unoppenedMail = data.mails.map((e:any)=>{e['id']=e['_id'];delete e['_id'];return e });
        }
        if (data.count){ 
          this.unoppenedMailCount = data.count;
          var info=this.events.infoEvent.getValue();
          info.unoppenedMailCount=data.count;
          this.events.changeInfoState(info);
        }
      },
      error: err => {

      }
    })
  }
  getTodeyCalender() {
    this.authService.geteventsDates().subscribe({
      next: data => {
        const todayDate = new Date();
        let todeyCount=0;
        let nextDate:Date=null as any;
        let date:Date;
        data.data.forEach((datee:Date)=>{
          date=new Date(datee);
          if (
            date.getDate() === todayDate.getDate() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getFullYear() === todayDate.getFullYear()
          )todeyCount++;
          if(date.getTime()>todayDate.getTime()){
            if(!nextDate||date.getTime()<nextDate.getTime())nextDate=date;
          }
        })
        var info=this.events.infoEvent.getValue();
        info.TodayEventsCount=todeyCount;
        info.nextEvent=nextDate;
        this.events.changeInfoState(info);
        console.log("calendar dates");
        
        console.log(data);
        
      },
      error: err => {

      }
    })
  }
  getnoppenedchat() {
    console.log('getnoppenedchat');

    this.authService.getunoppenedchat().subscribe({
      next: data => {
        console.log('getnoppenedchat data :');
        console.log(data);
        if (data.count) this.unoppenedchatCount = data.count;
          var info=this.events.infoEvent.getValue();
          info.unoppenedchatCount=this.unoppenedchatCount;
          this.events.changeInfoState(info);
      },
      error: err => {
        console.log('getnoppenedchat error :');
        console.log(err);

      }
    })
  }
  logout() {
    this.authService.sendPref({ darkTheme: this.DarkTheme, miniSideBar: this.showMiniSideBar }).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :" + err);
        //  this.loading=false;
      }
    });
    const chatter = this.storageService.getChatters();
    if (chatter.length > 1) {
      this.authService.putcontacts(chatter.filter(el => el.email != this.user.email)).subscribe({
        next: data => {
          console.log('data');
          console.log(data);
        },
        error: err => {
          console.log('err');
          console.log(err);
        }
      });
    }
    this.isLoggedIn = false;
    this.storageService.clearUser();

    this.storageService.clearChatters();
    this.user = null as any;
    this.events.changeLoggingState(-1);
    this.router.navigate(["/"]);
  }
  test() {
    if (this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :" + err);
        //  this.loading=false;
      }
    });
  }
  prepsubscription() {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.storageService.getUser();
      /*this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
      */
    }
  }
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.storageService.setPrefrences({ darkTheme: this.DarkTheme, miniSideBar: this.showMiniSideBar });
    if (this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        console.log("sendPref sessefull");
      },
      error: err => {
        console.log("sendPref errrrrrrr :" + err);
        //  this.loading=false;
      }
    });
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
    this.subscription5.unsubscribe();
    this.subscription6.unsubscribe();
    if (!this.state.remember && this.isLoggedIn) this.logout();
    this.socketService.disconnect();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.width=window.innerWidth;
    this.height=window.innerHeight;
    if (window.innerWidth <= 1024) this.isTabletMode = true;
    else this.isTabletMode = false;
  }

}
