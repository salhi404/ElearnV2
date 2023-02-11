/*import { Component, OnInit,OnDestroy } from '@angular/core';
import { User } from 'src/app/Interfaces/user';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'src/app/_services/storage.service';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { parsegrade,parseroles,getmainrole, getmainrolecode } from 'src/app/functions/parsers';
@Component({
  selector: 'app-mod-dashboard',
  templateUrl: './mod-dashboard.component.html',
  styleUrls: ['./mod-dashboard.component.scss']
})
export class ModDashboardComponent implements OnInit,OnDestroy  {
  user:User=null as any;
  roles:string[]=[];
  mainRole:String='';
  mainRolecode:number=-1;
  subscription: Subscription = new Subscription();
  isLoggedIn:boolean=false;
  navigationExtras: NavigationExtras = { state: null as any };
  constructor(private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,) { }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.user=this.storageService.getUser();
      this.subscription = this.events.userdataEvent.subscribe(
        state=>{
          console.log("userdataEvent 11");
          if(state.state==1)this.user=state.userdata;
        }
      )
    this.roles=parseroles(this.user.roles) ;
    this.mainRole=getmainrole(this.roles);
    this.mainRolecode=getmainrolecode(this.user.roles);
    console.log(this.mainRolecode );
    
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    //this.subscription2.unsubscribe();
  }

}*/