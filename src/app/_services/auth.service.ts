import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Mail } from '../Interfaces/Mail';
import { Pref } from '../Interfaces/user';

//const URL_API = 'https://ayoubauth.herokuapp.com/api/auth/';
//const URL_API = 'http://192.168.1.103:3000/'; 
// const URL_API = 'https://shoppingapptracker.herokuapp.com/';
//const URL_API = 'https://encouraging-crow.cyclic.app/';
//const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const AUTH_API = URL_API+'api/auth/';
const DATA_API = URL_API+'api/data/';
const USERDATA_API = URL_API+'api/userdata/';
const INFO_API = URL_API+'api/info/';
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

  register(username: string, email: string, password: string,fName:string,lName:string,birthDate:string,grade:number ): Observable<any> {
    //const roles=["user", "admin", "moderator"];
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
        fName,
        lName,
        birthDate,
        grade
      },
      httpOptions
    );
  }
  verifyDuplicated(username: string, email: string,): Observable<any> {
    //const roles=["user", "admin", "moderator"];
    return this.http.post(
      AUTH_API + 'verifyDuplicated',
      {
        username,
        email,
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
  verifyJwt():Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(AUTH_API + 'verifyjwt', {token}, httpOptions);
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
  addEvent(event:any):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'addevent', {event,token}, httpOptions);
  }
  setUserData(key:string, data:any):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'setData', {key,data,token}, httpOptions);
  }
  getUserData(key:string):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'getData', {key,token}, httpOptions);
  }
  getEvents():Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'getevents', {token}, httpOptions);
  }
  geteventsDates():Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'geteventsDates', {token}, httpOptions);
  }
  DeleteEvent(eventId:String):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'deleteevent', {token,eventId}, httpOptions);
  }
  editEvent(event:any,eventId:String):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(USERDATA_API + 'editevent', {token,eventId,event}, httpOptions);
  }
  getMail():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getmail', {token}, httpOptions);
  }
  getconnectedchatters(chaters:string[]):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(INFO_API + 'getconnectedchatters', {token,chaters}, httpOptions);
  }
  getChatLog(fromTo:string):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'getchatlog', {token,fromTo}, httpOptions);
  }
  marckchatasoppened(fromTo:string):Observable<any>{
    const token = this.storageService.getTokent();
    return this.http.post(DATA_API + 'marckchatasoppened', {token,fromTo}, httpOptions);
  }
  getUnoppenedMail():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getunoppenedmail', {token}, httpOptions);
  } 
  getunoppenedchat():Observable<any>{
    const token = this.storageService.getTokent();
    const id=this.storageService.getId();
    return this.http.post(DATA_API + 'getunoppenedchat', {token}, httpOptions);
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
