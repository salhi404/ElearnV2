import { Component, OnInit,OnDestroy} from '@angular/core';
import { User } from 'app/Interfaces/user';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'app/_services/auth.service';
import { EventsService } from 'app/services/events.service';
import { parsegrade,parseroles,getmainrole, getmainrolecode } from 'app/functions/parsers';
@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})

export class TeacherDashboardComponent implements OnInit,OnDestroy  {
  user:User=null as any;
  roles:string[]=[];
  mainRole:String='';
  mainRolecode:number=-1;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  isLoggedIn:boolean=false;
  activeroute:number=1;
  navigationExtras: NavigationExtras = { state: null as any };
  usersCount:number=-1;
  connectedCount:number=-1;
  constructor(private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router) { }
  ngOnInit(): void {
    switch (this.router.url) {
      case "/teacher-dashboard/classes":
        this.activeroute=1
      break;
      case "/teacher-dashboard/events":
        this.activeroute=2
      break;
      case "/teacher-dashboard/notifications":
        this.activeroute=3
      break;
      case "/teacher-dashboard/liveStreams":
        this.activeroute=4
      break;
      default:
        this.activeroute=-1
        break;
    }
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.user=this.storageService.getUser();
      this.subscription = this.events.userdataEvent.subscribe(
        state=>{
          if(state.state==1){
            this.user=state.userdata;
            this.roles=parseroles(this.user.roles) ;
            this.mainRole=getmainrole(this.roles);
            this.mainRolecode=getmainrolecode(this.user.roles);
            // if(!this.roles.includes('Teacher')){
            //   this.navigationExtras={ state: {errorNbr:403} };
            //   this.router.navigate(['/error'],this.navigationExtras);
            //   console.log("not autherised");
              
            // }
          }
          if(state.state==2){
            this.user=null as any;
            this.roles=[];
            this.mainRole='';
            this.mainRolecode=-1;
          }
          

        }
      )
    /*this.subscription1=this.events.modinfostatusEvent.subscribe(state=>{
      if(state.usersCount){
        this.usersCount=state.usersCount;
      }
      if(state.connectedCount){
        this.connectedCount=state.connectedCount;
      }
    })*/
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }

  }
  activateroute(ind:number){
    this.activeroute=ind;
    if (ind==1) {
      this.router.navigate(['/teacher-dashboard/classes']);
    }
    if (ind==2) {
      this.router.navigate(['/teacher-dashboard/events']);
    }
    if (ind==3) {
      this.router.navigate(['/teacher-dashboard/notifications']);
    }
    if (ind==4) {
      this.router.navigate(['/teacher-dashboard/liveStreams']);
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    //this.subscription2.unsubscribe();
  }

}
