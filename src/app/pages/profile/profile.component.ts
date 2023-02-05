import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from 'src/app/Interfaces/user';
import { StorageService } from 'src/app/_services/storage.service';
import {  Router, NavigationExtras } from '@angular/router';
import { retry, Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { parsegrade } from 'src/app/functions/parsers';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user:User=null as any;
  roles:string[]=[];
  mainRole:String='';
  userdetails:any={bio:''};
  subscription: Subscription = new Subscription;
  isLoggedIn:boolean=false;
  navigationExtras: NavigationExtras = { state: null as any };
  datepipe: DatePipe = new DatePipe('en-US');
  showenTab:number=0;
  showenTabFade:number=0;
  grade:string='';
  constructor(private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,) { }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.authService.getUserData('USERDETAILS').subscribe({
      next:data=>{
        console.log('USERDETAILS');
        console.log(data);  
        if(data.data)this.userdetails=data.data;     
      },
      error:err=>{
        console.log('USERDETAILS err');
        console.log(err);
      }
    })
    this.user=this.storageService.getUser();
      this.roles=this.user.roles.map(rl=>{switch (rl) {
        case "ROLE_USER":
          return 'Student';
        case "ROLE_MODERATOR":
          return 'Moderator';
        case "ROLE_ADMIN":
          return 'Admin';
      }
      return '';
    });
    this.mainRole=this.roles.includes('Admin')?'Admin':this.roles.includes('Moderator')?'Moderator':'Student';
    this.grade=parsegrade(this.user.grade);
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }
  }
  showTab(ind:number){
    this.showenTab=ind;
    setTimeout(() => {
      this.showenTabFade=ind;
    }, 10);
  }
}
