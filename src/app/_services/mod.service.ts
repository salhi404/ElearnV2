import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Mail } from '../Interfaces/Mail';
import { Pref } from '../Interfaces/user';
const URL_API = 'http://192.168.100.2:3000/'; 
// const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
// const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const MOD_API = URL_API+'api/mod/';
//mod service
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class ModService {

  constructor(private http: HttpClient,private storageService: StorageService) {}
  getUsers(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(MOD_API + 'getusers', {token}, httpOptions);
  }
  changeRoles(user:string,roles:any): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(MOD_API + 'changeroles', {token,user,roles}, httpOptions);
  }
  initiate(switchind:number): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(MOD_API + 'initiate', {token,switchind}, httpOptions);
  }
}
