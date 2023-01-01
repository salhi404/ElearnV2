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

  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  loading:boolean=false;
  constructor(
    //private localStore: LocalService,
    //private manageService :AuthManageService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
    ) { }

  ngOnInit(): void {
  }
  goToHomePage(user:string): void {
  //  setTimeout(() => {
      this.router.navigate(['']);
   // },400);
  }
  register(attempt:number):void{
    console.log("on submit trigered");
    const { username, email, password } = this.form;
    this.authService.register(username, email, password).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.authService.login(username, password).subscribe({
          next: data => {
            this.storageService.saveUser(data);
            console.log("logged in ");
            this.router.navigate(['']);
          },
          error: err => {
            this.errorMessage = err.error.message;
          }
        });
        this.loading=false;
      },
      error: err => {
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
      }
    });
  }
  onSubmit(): void {
    console.log("loggggggg");
    
    if(!this.loading){
      this.loading=true;
      this.register(1)
    }
    
  }
}
