import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
// const URL_API = 'http://192.168.1.103:3000/'; 
const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
// const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const USER_API = URL_API+'api/user/';
//User service 
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient,private storageService: StorageService) {}
  getNotifications(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(USER_API + 'getnotifications', {token}, httpOptions);
  }
  cancelnotification(uuid:string,notifId:string): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(USER_API + 'cancelnotification', {token,uuid,notifId}, httpOptions);
  }
  updatlastseen(newLastSeen:any[]): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(USER_API + 'updatlastseen', {token,newLastSeen}, httpOptions);
  }
  getaccestoken(code:string,): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(USER_API + 'getaccestoken', {token,code}, httpOptions);
  }
  getsignature(meetingNumber:string,role:number): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(USER_API + 'getsignature', {token,meetingNumber,role}, httpOptions);
  }
}
