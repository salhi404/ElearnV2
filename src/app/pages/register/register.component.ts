import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { Router } from '@angular/router';
//import { AuthManageService } from '../_services/auth-manage.service';
//import {LocalService} from '../local.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: any = {
    username: null,
    email: null,
    password: null,
    agree:null,
    frist_name:null,
    last_name:null,
    birth_date:null,
    grade:null
  };
  userExisted=false;
  emailExisted=false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  loading:boolean=false;
  changed=false;
  stageOne=true;
  constructor(
    //private localStore: LocalService,
    //private manageService :AuthManageService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
    ) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.router.navigate(["/home"]);
    }
  }
  goToHomePage(user:string): void {
  //  setTimeout(() => {
      this.router.navigate(['']);
   // },400);
  }
  register(attempt:number):void{
    console.log("on submit trigered");
    const { username,email,password,agree,frist_name,last_name,birth_date,grade} = this.form;
    this.authService.register(username,email,password,frist_name,last_name,birth_date,+grade).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.authService.login(username, password).subscribe({
          next: data => {
            this.storageService.saveUser(data);
            try {
              this.storageService.setPrefrences(JSON.parse(data.configs));
              this.storageService.saveChatters(data.contacts);
              console.log(data.contacts);
            } catch (error) {
              console.log(error);
              
            }
            this.router.navigate(['']);
          },
          error: err => {
            this.errorMessage = err.error.message;
          }
        });
        this.loading=false;
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
            this.register(attempt+1);
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
    if (this.storageService.isLoggedIn()) {
      this.router.navigate(["/home"]);
    }
    this.userExisted=false;
    this.emailExisted=false;
    if(!this.loading){
      this.loading=true;
      this.register(1)
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
}
