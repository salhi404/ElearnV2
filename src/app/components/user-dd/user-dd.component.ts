import { Component, OnInit,ElementRef, HostListener,Input } from '@angular/core';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import {  Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-user-dd',
  templateUrl: './user-dd.component.html',
  styleUrls: ['./user-dd.component.scss']
})
export class UserDDComponent implements OnInit {
  showuserDD:boolean=false;
  loading:boolean=false;
  @Input() username:string="";
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(this.eRef.nativeElement.contains(event.target)) {
     // console.log("clicked inside");
    } else {
      this.showuserDD=false;
      
    }
  }
  constructor(
    private eRef: ElementRef,
    private storageService: StorageService,
    private authService: AuthService,
    private events:EventsService,
    private router: Router,
    ) { }
  logOut(){
    this.loading=true;
    console.log("Logging out");
    this.authService.logout().subscribe({
      next: res => {
        console.log("Logged out");
        this.events.changeLoggingState(2);
        this.loading=false;
        this.router.navigate(['']);
      },
      error: err => {
        console.log("errrrrrrr :"+err);
      //  this.loading=false;
      }
    });
  }
  ngOnInit(): void {
  }

}
