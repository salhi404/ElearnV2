import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { Router } from '@angular/router';
import { User } from 'app/Interfaces/user';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})
export class ProfileSettingComponent implements OnInit {
  form: any = {
   /* username: null,
    email: null,*/
    agree:null,
    frist_name:null,
    last_name:null,
    birth_date:null,
    grade:null,
    bio:null,
    Oldpassword: null,
    Newpassword: null,
  };
  userExisted=false;
  wrongPassword=false;
  emailExisted=false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  loading:boolean=false;
  loading2:boolean=false;
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
    const {/* username,email,password,*/frist_name,last_name,birth_date,grade,bio} = this.form;
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
  register2():void{
    const Oldpassword=this.form.Oldpassword;
    const Newpassword =this.form.Newpassword;
    this.authService.changepassword(Oldpassword,Newpassword).subscribe({
      next: data => {
        console.log(data);
        this.wrongPassword = false;
        this.loading2=false;
      },
      error: err => {

        if(err.status==455){
          this.wrongPassword=true;
        }
          this.errorMessage = err.error.message;
          console.log(err.error);
          this.loading2=false;
          this.isSignUpFailed = true;
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
  onSubmitpass(){
    this.wrongPassword=false;
    if(!this.loading2){
      this.loading2=true;
      this.register2();
     console.log("submit");
    }
  }
}
