import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
const URL_API = 'http://192.168.1.103:3000/'; 
// const URL_API = 'https://starter-express-api-production-816a.up.railway.app/';
const MOD_API = URL_API+'api/mod/';
//mod service
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient,private storageService: StorageService) {}
  
}
