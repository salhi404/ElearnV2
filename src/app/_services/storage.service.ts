import { Injectable } from '@angular/core';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { User } from '../Interfaces/user';
const USER_KEY = 'authentication';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  clean(): void {
    localStorage.clear();
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
    var user:User={username:"null",email:"null",roles:[],verified:false}
    user.username=json.username?json.username:user.username;
    user.email=json.email?json.email:user.email;
    user.roles=json.roles?json.roles:user.roles;
    user.verified=json.verified?json.verified:user.verified;
    return user;
  }
}
