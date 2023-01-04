import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import {  Router, NavigationExtras } from '@angular/router';
import { User } from 'src/app/Interfaces/user';
//import { AuthManageService } from '../../_services/auth-manage.service';
//import {LocalService} from '../local.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  navigationExtras: NavigationExtras = { state: null as any };
  form: any = {
    username: null,
    password: null,
    remember:false
  };
  isLoggedIn = false;
  isLoginFailed = false;
  userNotFound =false;
  invalidpass=false;
  errorMessage = '';
  roles: string[] = [];
  loading:boolean=false;
  changed=false;
  constructor( 
  //private localStore: LocalService,
  //private dialog_service: NewItemDialogService,
  private authService: AuthService, 
  private storageService: StorageService,
  private router: Router,
  //private manageService :AuthManageService
  ) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }
  }
  register(attempt:number):void{
    const { username, password ,remember} = this.form;
    console.log("remember");
    console.log(remember);
   this.authService.login(username, password).subscribe({
      next: data => {
        console.log("sdsdsd"+remember);
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.storageService.setPrefrences(JSON.parse(data.configs));
       // this.roles = data.roles; altered
       // this.localStore.saveUserItems(data.username,this.localStore.toArreyOfObject(data.items));
      //  this.localStore.updateConfig(data.configs);
        this.goToHomePage(this.storageService.parseUser(data),remember);
      },
      error: err => {
        if(err.status==404)this.userNotFound=true;
        if(err.status==401)this.invalidpass=true;
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
          this.isLoginFailed = true;
          setTimeout (() => {
            this.register(attempt+1);
         }, time);
        }else{
          this.errorMessage = err.error.message;
          console.log(err.error);
          this.loading=false;
          this.isLoginFailed = true;
        }
      }
    });
  }
  onSubmit(): void {
    this.changed=false;
    this.userNotFound=false;
    this.invalidpass=false;
    if(!this.loading){
      this.loading=true;
      this.register(1)
    }
    
  }

  goToHomePage(user:User,remember:boolean): void {
   // setTimeout(() => {
      /*this.manageService.changeState(this.manageService.LOGIN);
      this.manageService.changeUserItems(user);*/
        this.navigationExtras={ state: {user:user,islogged:true,remember:remember}  };
        this.router.navigate([''],this.navigationExtras);
      
   // },400);
  }
}
