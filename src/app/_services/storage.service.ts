import { Injectable } from '@angular/core';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { Pref, User } from '../Interfaces/user';
const USER_KEY = 'authentication';
const PREFRENCES_KEY = 'PREFRENCES';
const MODMAIL_KEY = 'modifiedMail';
const Chatters_KEY = 'ChattersList';
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
    }/*else{
      const data = localStorage.getItem(PREFRENCES_KEY+"_global");
       if(data){
        pref=JSON.parse(data);
       }else{
        localStorage.setItem(PREFRENCES_KEY+"_global", JSON.stringify(pref));
       }
    }*/
    return pref;
  }
  public setPrefrences(pref:Pref){
    if(this.isLoggedIn()){
      localStorage.setItem(PREFRENCES_KEY+"_user", JSON.stringify(pref));
    }/*else{
      localStorage.setItem(PREFRENCES_KEY+"_global", JSON.stringify(pref));
    }*/
  }
  public clearUser():void{
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PREFRENCES_KEY+"_user");
  }
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public alterUser(toadd:any): void {
    const temp = localStorage.getItem(USER_KEY);
    if(temp){
      let user= JSON.parse(temp);
      for (const key in toadd) {
        if (toadd.hasOwnProperty(key)) {
          user[key]=toadd[key]
        }
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

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
  parseUser(json:any) :User{//alterauthuserdata   
    var user:User={username:"null",email:"null",roles:[],verified:false,pref:{darkTheme:false,miniSideBar:false},
      profileImage:'??',USERDETAILS:{},contacts:[],fName:'',lName:'', birthDate:new Date(0),grade:-1}
    user.username=json.username?json.username:user.username;
    user.email=json.email?json.email:user.email;
    user.roles=json.roles?json.roles:user.roles;
    user.verified=json.verified?json.verified:user.verified;
    user.pref=json.configs?json.configs:user.pref;
    user.contacts=json.contacts?json.contacts:user.contacts;
    user.fName=json.fName?json.fName:user.fName;
    user.lName=json.lName?json.lName:user.lName;
    user.birthDate=json.birthDate?json.birthDate:user.birthDate;
    user.grade=json.grade?json.grade:user.grade;
    user.profileImage=json.profileImage?json.profileImage:user.profileImage;
    user.USERDETAILS=json.USERDETAILS?json.USERDETAILS:user.USERDETAILS;
    return user;
  }
  public saveModMail(mod:any[]){
    localStorage.removeItem(MODMAIL_KEY);
    localStorage.setItem(MODMAIL_KEY, JSON.stringify(mod));
  }
  public getModMail():any[]{
    const mod = localStorage.getItem(MODMAIL_KEY);
    if (mod) {
      return JSON.parse(mod);
    }
    return [];
  }
  public clearModMail():void{
    localStorage.removeItem(MODMAIL_KEY);
  }
  public saveChatters(list:any[]){
    console.log("chatters ");
    console.log(list);
    localStorage.removeItem(Chatters_KEY);
    localStorage.setItem(Chatters_KEY, JSON.stringify(list));
  }
  public getChatters():any[]{
    const list = localStorage.getItem(Chatters_KEY);
    if (list) {
      return JSON.parse(list);
    }
    return [];
  }
  public clearChatters():void{
    localStorage.removeItem(Chatters_KEY);
  }
}
