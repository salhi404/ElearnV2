import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
// const URL_API = 'http://192.168.1.2:3000/'; 
const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
// const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const STUDENT_API = URL_API+'api/students/';
//Teacher service  
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient,private storageService: StorageService) {}
  getClasses(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(STUDENT_API + 'getclasses', {token}, httpOptions);
  }
  enroll(uuid:string): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(STUDENT_API + 'enroll', {token,uuid}, httpOptions);
  }
  getStreams(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(STUDENT_API + 'getstreams', {token}, httpOptions);
  }
  getsignature (uuid:string,indd:number): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(STUDENT_API + 'getsignature', {token,uuid,indd}, httpOptions);
  }
  startStream(params:any): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(STUDENT_API + 'startStream', {token,params}, httpOptions);
  }

}
