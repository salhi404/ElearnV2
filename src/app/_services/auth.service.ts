import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Mail } from '../Interfaces/Mail';
import { Pref } from '../Interfaces/user';

//const URL_API = 'https://ayoubauth.herokuapp.com/api/auth/';
const URL_API = 'http://192.168.1.101:3000/'; 
// const URL_API = 'https://shoppingapptracker.herokuapp.com/';
//const URL_API = 'https://encouraging-crow.cyclic.app/';
//const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
const AUTH_API = URL_API+'api/auth/';
const DATA_API = URL_API+'api/data/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient,private storageService: StorageService) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    //const roles=["user", "admin", "moderator"];
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
        //roles,
      },
      httpOptions
    );
  }

  logout(): Observable<any> {
    console.log("Logging out auth");
    return this.http.post(AUTH_API + 'signout', { }, httpOptions);
  }
  verifyMail(mail:string): Observable<any> {
    //const token = this.storageService.getTokent();
    return this.http.post(AUTH_API + 'verifymail', {mail/*,token*/}, httpOptions);
  }
  verify(id:string,token:string): Observable<any> {
    return this.http.put(AUTH_API + 'verify', {id,token}, httpOptions);
  }
  sendMail(mail:Mail,provided:number):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'sendmail', {mail,provided,token}, httpOptions);
  }
  syncMailTags(tags:any[]):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'syncmailtags', {tags,token}, httpOptions);
  }
  deleteMail(mails:string[]):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'deletemail', {mails,token}, httpOptions);
  }
  sendPref(pref:Pref):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'sendPref', {pref,token}, httpOptions);
  }
  getMail():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getmail', {token}, httpOptions);
  }
  getChatLog(owner:string,fromTo:string):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'getchatlog', {token,fromTo}, httpOptions);
  }
  getUnoppenedMail():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getunoppenedmail', {token}, httpOptions);
  }
  getMailUpdate():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getmailupdate', {token}, httpOptions);
  }
  putItems(items:any[]): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.put(AUTH_API + 'putitems', {items,token}, httpOptions);
  }
  putcontacts(contacts:any[]): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'putcontacts', {contacts,token}, httpOptions);
  }
  putConfigs(configs:string): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.put(AUTH_API + 'putconfig', {configs,token}, httpOptions);
  }
  sendverificationcation(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.put(AUTH_API + 'sendverification', {token}, httpOptions);
  }
  testApi(msg:string): Observable<any> {
    return this.http.post(AUTH_API + 'test', {msg}, httpOptions);
  }
  
}
