import { Component, OnInit,OnDestroy,AfterViewInit,Renderer2   } from '@angular/core';
import { User } from 'app/Interfaces/user';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'app/services/events.service';
import { parsegrade,parseroles,getmainrole, getmainrolecode } from 'app/functions/parsers';
@Component({
  selector: 'app-mod-dashboard',
  templateUrl: './mod-dashboard.component.html',
  styleUrls: ['./mod-dashboard.component.scss']
})
export class ModDashboardComponent implements OnInit,OnDestroy ,AfterViewInit {
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
  constructor(private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,private renderer: Renderer2 ,) { }
  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.user=this.storageService.getUser();
      this.subscription = this.events.userdataEvent.subscribe(
        state=>{
          if(state.state==this.events.UPDATEUSER){
            this.user=state.userdata;
            this.roles=parseroles(this.user.roles) ;
            this.mainRole=getmainrole(this.roles);
            this.mainRolecode=getmainrolecode(this.user.roles);
            if(!this.roles.includes('Admin')){
              this.navigationExtras={ state: {errorNbr:403} };
              this.router.navigate(['/error'],this.navigationExtras);
              console.log("not autherised");
              
            }
          }
          if(state.state==this.events.DALETEUSER){
            this.user=null as any;
            this.roles=[];
            this.mainRole='';
            this.mainRolecode=-1;
          }
          

        }
      )
    this.subscription1=this.events.modinfostatusEvent.subscribe(state=>{
      if(state.usersCount){
        this.usersCount=state.usersCount;
      }
      if(state.connectedCount){
        this.connectedCount=state.connectedCount;
      }
    })
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }

  }
  activateroute(ind:number){
    this.activeroute=ind;
    if (ind==1) {
      this.router.navigate(['/mod-dashboard/users']);
    }
    if (ind==2) {
      this.router.navigate(['/mod-dashboard/users']);
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngAfterViewInit(): void {

  }
}
