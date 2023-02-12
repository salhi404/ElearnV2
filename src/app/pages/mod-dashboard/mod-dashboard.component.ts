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
  isLoggedIn:boolean=false;
  activeroute:number=1;
  navigationExtras: NavigationExtras = { state: null as any };
  constructor(private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,private renderer: Renderer2 ,) { }
  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.user=this.storageService.getUser();
      this.subscription = this.events.userdataEvent.subscribe(
        state=>{
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
  activateroute(ind:number){
    this.activeroute=ind;
    if (ind==1) {
      this.router.navigate(['./users-mod']);
    }
    if (ind==2) {
      this.router.navigate(['./notifications-mod']);
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    //this.subscription2.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.renderer.listen('document', 'click', (event) => {
      if (event.target.hasAttribute("user-id")) {
        this.router.navigate(["/person/" + event.target.getAttribute("user-id")]);
        console.log(event.target.getAttribute("user-id"));
        
        
      }
    });
  }
}
