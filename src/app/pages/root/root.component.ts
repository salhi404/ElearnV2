import { Component, OnInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventsService } from 'app/services/events.service';
import { StorageService } from 'app/_services/storage.service';
import { AuthService } from '../../_services/auth.service';
import { User } from 'app/Interfaces/user';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Mail } from 'app/Interfaces/Mail';
import { SocketioService } from 'app/services/socketio.service';
import { getmainrolecode } from 'app/functions/parsers'
import { UserService } from '../../_services/user.service';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit, OnDestroy {
  elementfooterHeight: number = 0;
  currentRoute: number = 0;
  interfaceLayout: boolean = false;
  unoppenedchatCount: number = 0;
  constructor(
    private router: Router,
    private events: EventsService,
    private storageService: StorageService,
    private authService: AuthService,
    private socketService: SocketioService,
    private UserService:UserService
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
      if (!this.storageService.isLoggedIn() && event.url != "/login" && event.url != "/signup") {
        this.router.navigate(["/"]);
      }
      this.interfaceLayout = false;
      switch (event.url.split('/')[1].split('?')[0]) {
        case "":
          if (this.storageService.isLoggedIn()) this.router.navigate(["home"]);
          this.currentRoute = 0;
          this.interfaceLayout = true;
          break;
        case "home":
          this.currentRoute = 1;
          this.getTodeyCalender();
          break;
        case "email":
          this.currentRoute = 2;
          break;
        case "chat":
          this.currentRoute = 3;
          break;
        case "calendar":
          this.currentRoute = 4;
          break;
        case "profile":
          this.currentRoute = 5;
          break;
        case "mod-dashboard":
          this.currentRoute = 6;
          break;
        case "teacher-dashboard":
          this.currentRoute = 7;
          break;
        case "classes":
          this.currentRoute = 8;
          break;
        case "notifications":
          this.currentRoute = 9;
          break;
        case "liveStreams":
          this.currentRoute = 10;
          break;  
          case "reroute":
          this.currentRoute = 11;
          break; 
        default:
          if (this.storageService.isLoggedIn()) this.router.navigate(["/home"]);
          this.currentRoute = 0;
          this.interfaceLayout = true;
          break
      }

    });
  }
  interval1:any;
  width: number = 0;
  height: number = 0;
  unoppenedMail: Mail[] = [];
  unoppenedMailCount: number = 0;
  showSettingPanel: boolean = false
  subscription: Subscription = new Subscription;
  subscription2: Subscription = new Subscription;
  subscription3: Subscription = new Subscription;
  subscription4: Subscription = new Subscription;
  subscription5: Subscription = new Subscription;
  subscription6: Subscription = new Subscription;
  subscription7: Subscription = new Subscription;
  subscription8: Subscription = new Subscription;
  subscription9: Subscription = new Subscription;
  subscription9firstrigger:boolean=true;
  showMiniSideBar: boolean = false;
  isTabletMode: boolean = false;
  DarkTheme: boolean = false;
  isLoggedIn = false;
  mailUpadte: number = -1;
  user: User = null as any;
  state: any = { user: this.user, islogged: false, remember: true };
  userSent: boolean = false;
  roles: string[] = [];
  mainrole: number = -1;
  notifications: any[] = [];
  notifClasses: any[] = [];
  newLastSeen:any[]=[];

  ngOnInit(): void {
    this.onWindowResize();
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.storageService.getUser();
      this.authService.verifyJwt().subscribe({
        next: data => {
          if (!data.verified) {
            this.logout();
          } else {
            if (data.user) {
              this.storageService.alterUser(data.user);
              this.user = this.storageService.getUser();
              // console.log("user updated ",this.user);
              this.events.changeuserdataState({ state: 1, userdata: this.user });
            }
          }
        }, error: err => {
          // if(!err.verified)this.logout();
          // TODO - add a "server is down page"
          // TODO - handle user update,deletion ... "
        }
      });

    }
    if (this.state.islogged) {
      this.isLoggedIn = this.state.islogged;
      this.user = this.state.user;
      this.events.changeuserdataState({ state: 1, userdata: this.user });
    }
    if (this.isLoggedIn) {
      //this.prepsubscription();
      // this.socketService.setupSocketConnection(this.storageService.getTokent());
      this.socketService.getMsg();
      this.socketService.getNotifications();
      this.socketService.getclassTask();

      //this.getMailUpdate();
      /*setInterval(() => {
        this.getMailUpdate();
      }, 12000);*/
      this.subscription7 = this.events.userdataEvent.subscribe(
        state => {
          if (state.state == this.events.UPDATEUSER) {
            this.user = state.userdata;
            this.roles = state.userdata.roles;
            this.mainrole = getmainrolecode(this.roles);
          }
          if (state.state == this.events.DALETEUSER) {
            this.user = state.userdata;
            this.roles = [];
            this.mainrole = -1;
          }
          const pref = this.storageService.getPrefrences();
          this.DarkTheme = pref.darkTheme;
          this.showMiniSideBar = pref.miniSideBar;
        }
      )
      this.getnotifications();
      this.getnoppenedMail();
      this.getnoppenedchat();
      this.updateContacts();
      this.updateschedule();
      this.interval1 = setInterval(()=>{this.updateschedule();}, 150000);
      this.subscription3 = this.socketService.recieveMsg.subscribe(data => {
        if (data.code == 1) this.unoppenedchatCount++;
        var info = this.events.infoEvent.getValue();
        info.unoppenedchatCount = this.unoppenedchatCount;
        this.events.changeInfoState(info);
      });
      this.subscription4 = this.events.currentchatEvent.subscribe(state => {
        if (state >= 0) {
          this.unoppenedchatCount = state;
          var info = this.events.infoEvent.getValue();
          info.unoppenedchatCount = this.unoppenedchatCount;
          this.events.changeInfoState(info);
        }
      })
      this.subscription6 = this.events.updateEvent.subscribe(state => {
        if (state == this.events.UPDATEUSER) {
          this.user = this.storageService.getUser();
          this.events.changeuserdataState({ state: 1, userdata: this.user });

        }
      })
      this.subscription5 = this.events.infostatusEvent.subscribe(state => {
        if (state.unoppenedchatCount) {
          this.unoppenedchatCount = state.unoppenedchatCount;
        }
        if (state.unoppenedMailCount) {
          this.unoppenedMailCount = state.unoppenedMailCount;
        }

      })
    }
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
      this.subscription8 = this.events.notificationsEvent.subscribe(
        state => {
          console.log("notificationsEvent ",state);
          if(state.state==this.events.NOTIFUPDATE){
            this.notifications=state.data.notifications;
            this.newLastSeen=state.data.newLastSeen;
          }
          if(state.state==this.events.NOTIFDELETE){
            this.notifications=state.data.notifications;
          }
          if(state.state==this.events.NOTIFREQUPDATE){
            this.getnotifications();
          }
          if(state.state==this.events.NOTIFNEW){
            this.notifications=state.data.newNotifsent.concat(this.notifications);
            this.newLastSeen=state.data.newLastSeen;
          }
          

        }
      );
      this.subscription9 = this.socketService.recieveNotif.subscribe(data => {
        if(!this.subscription9firstrigger){
          console.log("subscription4",data);
          if (data.code == 1) {
            if(this.notifClasses.length){
              let newNotifsent :any[]=[]
              data.data.forEach((element:any) => {
                const newlastseenNotifs =this.newLastSeen.find((elm:any)=>elm.uuid==element.uuid)
                if(newlastseenNotifs && element.id>newlastseenNotifs.notifs) newlastseenNotifs.notifs=element.id
                const findclass=this.notifClasses.find((ntf:any)=>ntf.uuid==element.uuid);
                if(findclass)newNotifsent.push({...element,class:findclass.name});
              });
              this.events.changenotificationsState({state:this.events.NOTIFNEW,data:{newNotifsent,newLastSeen:this.newLastSeen}})
            }
          }
        }else{
          this.subscription9firstrigger=false;
        }
        
      });
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
  getnotifications() {
    this.UserService.getNotifications().subscribe({
      next: data => {
        console.log("getnotifications : ",data);
        let tempNotifs :any[]=[];
        let newNotifs :any[]=[];
        let newLastSeen:any[]=[...data.lastseen];
        this.notifClasses=data.notifications.map((ntf:any)=>ntf.class);
        data.notifications.forEach((clntf:any) => {
          console.log("data.canceledNotifs",data.canceledNotifs);
          console.log("clntf.class.uuid",clntf.class.uuid);
          
          const canceledNotifs =data.canceledNotifs.find((elm:any)=>elm.uuid==clntf.class.uuid)
          const lastseenNotifs =data.lastseen.find((elm:any)=>elm.uuid==clntf.class.uuid)
          const newlastseenNotifs =newLastSeen.find((elm:any)=>elm.uuid==clntf.class.uuid)
          console.log("canceledNotifs",canceledNotifs );
          
          clntf.data.forEach((notif:any) => {
            if(!canceledNotifs.notifs.includes(notif.id))  {
              tempNotifs.push({...notif,class:clntf.class.name,uuid:clntf.class.uuid});
              if(notif.id>lastseenNotifs.notifs) {
                newNotifs.push({...notif,class:clntf.class.name,uuid:clntf.class.uuid});
                if(notif.id>newlastseenNotifs.notifs) newlastseenNotifs.notifs=notif.id
              }
            }
          });
        });
        tempNotifs.sort(function (a:any, b:any) {
          return (new Date(b.time).getTime()) - (new Date(a.time).getTime());
        });
        this.events.changenotificationsState({state:this.events.NOTIFUPDATE,data:{notifications:tempNotifs,newNotifs,newLastSeen}})
      },
      error: err => {

      }
    })
  }


  updateschedule () {
    this.authService.updateschedule().subscribe({
      next: data => {
        console.log("updateschedule",data);
      },
      error: err => {
        console.log("updateschedule failed",err); 
      }
    })
  }
  getnoppenedMail() {
    this.authService.getUnoppenedMail().subscribe({
      next: data => {
        if (data.mails) {
          this.unoppenedMail = data.mails.map((e: any) => { e['id'] = e['_id']; delete e['_id']; return e });
        }
        if (data.count) {
          this.unoppenedMailCount = data.count;
          var info = this.events.infoEvent.getValue();
          info.unoppenedMailCount = data.count;
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
        let todeyCount = 0;
        let nextDate: Date = null as any;
        let date: Date;
        data.data.forEach((datee: Date) => {
          date = new Date(datee);
          if (
            date.getDate() === todayDate.getDate() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getFullYear() === todayDate.getFullYear()
          ) todeyCount++;
          if (date.getTime() > todayDate.getTime()) {
            if (!nextDate || date.getTime() < nextDate.getTime()) nextDate = date;
          }
        })
        var info = this.events.infoEvent.getValue();
        info.TodayEventsCount = todeyCount;
        info.nextEvent = nextDate;
        this.events.changeInfoState(info);
      },
      error: err => {

      }
    })
  }
  getnoppenedchat() {
    this.authService.getunoppenedchat().subscribe({
      next: data => {
        if (data.count) this.unoppenedchatCount = data.count;
        var info = this.events.infoEvent.getValue();
        info.unoppenedchatCount = this.unoppenedchatCount;
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
        // console.log("sendPref sessefull");
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
        },
        error: err => {
          console.log(' putcontacts err');
          console.log(err);
        }
      });
    }
    this.isLoggedIn = false;
    this.storageService.clearUser();
    this.events.changeLoggingState(-1);
    this.events.changeuserdataState({ state: 2, userdata: null as any });
    this.router.navigate([""]);
  }
  test() {
    if (this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        // console.log("sendPref sessefull");
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
  updateContacts() {
    this.authService.getcontacts().subscribe({
      next: data => {
        if (data.contacts) this.storageService.saveChatters(data.contacts);
      }, error: err => {
        console.log("updateContacts error", err);
      }
    });
  }
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.storageService.setPrefrences({ darkTheme: this.DarkTheme, miniSideBar: this.showMiniSideBar });
    if (this.isLoggedIn) this.authService.sendPref(this.storageService.getPrefrences(true)).subscribe({
      next: res => {
        // console.log("sendPref sessefull");
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
    this.subscription7.unsubscribe();
    this.subscription8.unsubscribe();
    this.subscription9.unsubscribe();
    clearInterval(this.interval1);
    if (!this.state.remember && this.isLoggedIn) this.logout();
    this.socketService.disconnect();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (window.innerWidth <= 1024) this.isTabletMode = true;
    else this.isTabletMode = false;
  }

}
