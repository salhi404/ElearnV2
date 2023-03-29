import { Injectable } from '@angular/core';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { Pref, User } from '../Interfaces/user';
const USER_KEY = 'authentication';
const PREFRENCES_KEY = 'PREFRENCES';
const tokens_KEY = 'TOKENS';
const MODMAIL_KEY = 'modifiedMail';
const Chatters_KEY = 'ChattersList';
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  clean(): void {
    localStorage.clear();
  }
  public getPrefrences(isforUser?: boolean): Pref {
    var pref = { darkTheme: false, miniSideBar: false }
    var forUser = false;
    if (typeof isforUser !== 'undefined') {
      forUser = true;
    }
    if (this.isLoggedIn() || forUser) {
      const data = localStorage.getItem(PREFRENCES_KEY + "_user");
      if (data && this.isLoggedIn()) {
        pref = JSON.parse(data);
      } else {
        localStorage.setItem(PREFRENCES_KEY + "_user", JSON.stringify(pref));
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
  public setPrefrences(pref: Pref) {
    if (this.isLoggedIn()) {
      localStorage.setItem(PREFRENCES_KEY + "_user", JSON.stringify(pref));
    }/*else{
      localStorage.setItem(PREFRENCES_KEY+"_global", JSON.stringify(pref));
    }*/
  }
  public clearUser(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PREFRENCES_KEY + "_user");
  }

  public getzoomTokens(key: string): any {
    var tokens = { zoomtoken: '',zoom_refresh_token: '', zoomtoken_expire: new Date() }
    const data = localStorage.getItem(tokens_KEY);
    if (data) {
      tokens = JSON.parse(data);
    } else {
      localStorage.setItem(tokens_KEY, JSON.stringify(tokens));
    }
    switch (key) {
      case "zoomtoken":
        return { zoomtoken: tokens.zoomtoken, zoomtoken_expire: tokens.zoomtoken_expire,zoom_refresh_token: tokens.zoom_refresh_token };
        break;
    }
    return tokens;
  }
  public setzoomtoken(key: string, data: any) {
    console.log("setzoomtoken data : ",data);
    var tokens = { zoomtoken: '',zoom_refresh_token: '', zoomtoken_expire: new Date() }
    const datatemp = localStorage.getItem(tokens_KEY);
    if (datatemp) { tokens = JSON.parse(datatemp); }
    switch (key) {
      case "zoomtoken":
        tokens.zoomtoken = data.zoomtoken;
        tokens.zoomtoken_expire = data.zoomtoken_expire;
        tokens.zoom_refresh_token = data.zoom_refresh_token;
        break;
    }
    localStorage.setItem(tokens_KEY, JSON.stringify(tokens));
    
    
  }
  public clearzoomtoken(key: string): void {
    const datatemp = localStorage.getItem(tokens_KEY);
    if (datatemp) {
      var data = JSON.parse(datatemp);
      switch (key) {
        case "zoomtoken":
          data.zoomtoken = '';
          data.zoom_refresh_token = '';
          data.zoomtoken_expire = new Date;
          break;
        case "":
          localStorage.removeItem(tokens_KEY);
          break;
      }
    }
  }
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public alterUser(toadd: any): void {
    const temp = localStorage.getItem(USER_KEY);
    if (temp) {
      let user = JSON.parse(temp);
      for (const key in toadd) {
        if (toadd.hasOwnProperty(key)) {
          user[key] = toadd[key]
        }
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

  }

  public verify(): void {
    let user = this.getUser();
    user.verified = true;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public getUser(): User {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      const temp = JSON.parse(user);
      return this.parseUser(temp);
    }
    return null as any;
  }
  public getTokent(): string {
    return this.getUserParms().token;
  }
  public getId(): string {
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
  parseUser(json: any): User {//alterauthuserdata   
    var user: User = {
      username: "null", email: "null", roles: [], verified: false, pref: { darkTheme: false, miniSideBar: false },
      profileImage: '??', USERDETAILS: {}, contacts: [],data:{}, fName: '', lName: '', birthDate: new Date(0), grade: -1, info: { classesCount: 0, classesenrollCount: 0 }
    }//adduserinfo
    user.username = json.username ? json.username : user.username;
    user.email = json.email ? json.email : user.email;
    user.roles = json.roles ? json.roles : user.roles;
    user.verified = json.verified ? json.verified : user.verified;
    user.pref = json.configs ? json.configs : user.pref;
    user.contacts = json.contacts ? json.contacts : user.contacts;
    user.fName = json.fName ? json.fName : user.fName;
    user.lName = json.lName ? json.lName : user.lName;
    user.birthDate = json.birthDate ? json.birthDate : user.birthDate;
    user.grade = json.grade ? json.grade : user.grade;
    user.profileImage = json.profileImage ? json.profileImage : user.profileImage;
    user.USERDETAILS = json.USERDETAILS ? json.USERDETAILS : user.USERDETAILS;
    user.info = json.info ? json.info : user.info;
    user.data = json.data ? json.data : user.data;
    return user;
  }
  public saveModMail(mod: any[]) {
    localStorage.removeItem(MODMAIL_KEY);
    localStorage.setItem(MODMAIL_KEY, JSON.stringify(mod));
  }
  public getModMail(): any[] {
    const mod = localStorage.getItem(MODMAIL_KEY);
    if (mod) {
      return JSON.parse(mod);
    }
    return [];
  }
  public clearModMail(): void {
    localStorage.removeItem(MODMAIL_KEY);
  }
  public saveChatters(list: any[]) {
    localStorage.removeItem(Chatters_KEY);
    localStorage.setItem(Chatters_KEY, JSON.stringify(list));
  }
  public getChatters(): any[] {
    const list = localStorage.getItem(Chatters_KEY);
    if (list) {
      return JSON.parse(list);
    }
    return [];
  }
  public clearChatters(): void {
    localStorage.removeItem(Chatters_KEY);
  }
}
