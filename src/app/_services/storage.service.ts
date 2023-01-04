import { Injectable } from '@angular/core';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { Pref, User } from '../Interfaces/user';
const USER_KEY = 'authentication';
const PREFRENCES_KEY = 'PREFRENCES';
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  clean(): void {
    localStorage.clear();
  }
  public getPrefrences(isforUser?:boolean):Pref{
    var pref={darkTheme:false,miniSideBar:false}
    var forUser =false;
    if (typeof isforUser !== 'undefined') {
      forUser=true;
    }
    if(this.isLoggedIn()||forUser){
       const data = localStorage.getItem(PREFRENCES_KEY+"_user");
       if(data){
        pref=JSON.parse(data);
       }else{
        localStorage.setItem(PREFRENCES_KEY+"_user", JSON.stringify(pref));
       }
    }else{
      const data = localStorage.getItem(PREFRENCES_KEY+"_global");
       if(data){
        pref=JSON.parse(data);
       }else{
        localStorage.setItem(PREFRENCES_KEY+"_global", JSON.stringify(pref));
       }
    }
    return pref;
  }

  public setPrefrences(pref:Pref){
    if(this.isLoggedIn()){
      localStorage.setItem(PREFRENCES_KEY+"_user", JSON.stringify(pref));
    }else{
      localStorage.setItem(PREFRENCES_KEY+"_global", JSON.stringify(pref));
    }
  }
  public clearUser():void{
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PREFRENCES_KEY+"_user");
  }
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public verify(): void {
    let user =this.getUser();
    user.verified=true;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public getUser(): User {
    const user = localStorage.getItem(USER_KEY);
    //console.log(user);
    if (user) {
      const temp= JSON.parse(user);
      return this.parseUser(temp);
    }
    return null as any;
  }
  public getTokent():string{
    return this.getUserParms().token;
  }
  public getId():string{
    return this.getUserParms().id;
  }
  public getUserParms(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null as any;
  }
  public isLoggedIn(): boolean {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return true;
    }
    return false;
  }
  parseUser(json:any) :User{
    var user:User={username:"null",email:"null",roles:[],verified:false,pref:{darkTheme:false,miniSideBar:false}}
    user.username=json.username?json.username:user.username;
    user.email=json.email?json.email:user.email;
    user.roles=json.roles?json.roles:user.roles;
    user.verified=json.verified?json.verified:user.verified;
    user.pref=json.configs?json.configs:user.pref;
    return user;
  }
}
