import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
// const URL_API = 'http://192.168.1.103:3000/'; 
// const URL_API = 'https://frantic-colt-leather-jacket.cyclic.app/';
const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const TEACHER_API = URL_API+'api/teacher/';
//Teacher service  
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient,private storageService: StorageService) {}
  getClasses(): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'getclasses', {token}, httpOptions);
  }
  addclass(classname:string,subject:number): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'addclass', {token,classname,subject}, httpOptions);
  }
  editacceptedstudent(classrm:string,student:string,isAccepting:boolean): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'editacceptedstudent', {token,classrm,student,isAccepting}, httpOptions);
  }
  getClassEvents(uuid:string): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'getclassevents', {token,uuid}, httpOptions);
  }

  addclassevent(uuid:string,event:any): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'addclassevent', {token,uuid,event}, httpOptions);
  }
  editclassevent(uuid:string,eventId:String,event:any): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'editclassevent', {token,uuid,event,eventId}, httpOptions);
  }
  deleteclassevent(uuid:string,eventId:String): Observable<any> {
    const token = this.storageService.getTokent();
    return this.http.post(TEACHER_API + 'deleteclassevent', {token,uuid,eventId}, httpOptions);
  }
  



}
