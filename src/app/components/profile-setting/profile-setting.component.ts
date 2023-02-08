import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { Router } from '@angular/router';
import { User } from 'src/app/Interfaces/user';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})
export class ProfileSettingComponent implements OnInit {
  form: any = {
   /* username: null,
    email: null,*/
    password: null,
    agree:null,
    frist_name:null,
    last_name:null,
    birth_date:null,
    grade:null,
    bio:null,
  };
  userExisted=false;
  emailExisted=false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  loading:boolean=false;
  changed=false;
  stageOne=true;
  datepipe: DatePipe = new DatePipe('en-US');
  @Input() user:User=null as any;
  subscription: Subscription=new Subscription();
  constructor(
    //private localStore: LocalService,
    //private manageService :AuthManageService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private events:EventsService
    ) { }

  ngOnInit(): void {
    this.form.username=this.user.username;
    this.form.email=this.user.email;
    this.form.frist_name=this.user.fName;
    this.form.last_name=this.user.lName;
    this.form.birth_date=this.datepipe.transform(this.user.birthDate,"yyyy-MM-dd") ;
    this.form.grade=this.user.grade;
    this.form.bio=this.user.USERDETAILS.bio;
  }
  register():void{
    console.log("on submit trigered");
    const {/* username,email,*/password,frist_name,last_name,birth_date,grade,bio} = this.form;
    this.authService.updateInfo(/*username,email,password,*/frist_name,last_name,birth_date,+grade,{bio:bio}).subscribe({
      next: data => {
        console.log("secsess");
        console.log(data);
        this.storageService.alterUser(data);
        this.user=this.storageService.getUser();
        this.events.changeupdateState(this.events.UPDATEUSER);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading=false;
      },
      error: err => {
       /* if(err.status==457)this.userExisted=true;
        if(err.status==458)this.emailExisted=true;*/
        this.errorMessage = err.error.message;
        console.log(err.error);
        this.loading=false;
        this.isSignUpFailed = true;
        this.changed=false;
      }
    });
  }
  register2(attempt:number):void{
    console.log("next trigered");
    const { username, email } = this.form;
    this.authService.verifyDuplicated(username, email).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading=false;
        this.stageOne=false;
      },
      error: err => {
        if(err.status==457)this.userExisted=true;
        if(err.status==458)this.emailExisted=true;
        if(err.status==500 && attempt<6){
          var time=0;
          switch (attempt) {
            case 1:
              time=5000;
              break;
            case 2:
              time=10000;
              break;
            case 3:
              time = 15000;
              break;
            default: time=20000;
              break;
          }
          this.errorMessage = err.error.message+" attempting again ("+(attempt+1)+"/6) in "+(time/1000)+"s";
          this.isSignUpFailed = true;
          setTimeout (() => {
            this.register2(attempt+1);
         }, time);
        }else{
          this.errorMessage = err.error.message;
          console.log(err.error);
          this.loading=false;
          this.isSignUpFailed = true;
        }
        this.changed=false;
      }
    });
  }
  onSubmit(): void {
    this.userExisted=false;
    this.emailExisted=false;
    if(!this.loading){
      this.loading=true;
      this.register();
     console.log("submit");
     
    }
  }
  nextinfo(){
    if (this.storageService.isLoggedIn()) {
      this.router.navigate(["/home"]);
    }
    this.userExisted=false;
    this.emailExisted=false;
    if(!this.loading){
      this.loading=true;
      this.register2(1)
    }
    
  }
  onSubmitpass(){
    
  }
}
