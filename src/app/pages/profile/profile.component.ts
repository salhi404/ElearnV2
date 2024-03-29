import { Component, ElementRef, HostListener, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from 'app/Interfaces/user';
import { StorageService } from 'app/_services/storage.service';
import { Router, NavigationExtras } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'app/services/events.service';
import { parsegrade,parseroles,getmainrole } from 'app/functions/parsers';
//import { FileUploader } from 'ng2-file-upload'; 
import { base64ToFile, Dimensions, ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit,OnDestroy {
  user:User=null as any;
  roles:string[]=[];
  mainRole:String='';
  userdetails:any={bio:''};
  subscription: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  isLoggedIn:boolean=false;
  navigationExtras: NavigationExtras = { state: null as any };
  datepipe: DatePipe = new DatePipe('en-US');
  showenTab:number=1  ;
  showenTabFade:number=1  ;
  blockHostListener: boolean=false;
  grade:string='';
  modalEvent: Subject<number> = new Subject<number>();

  constructor(private imageCompress: NgxImageCompressService,private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
 /* public uploader: FileUploader = new FileUploader({
    url: USERDATA_API+ 'profileImage',
    itemAlias: 'profileInput',
    headers: [{ name: 'foofoo', value: 'passengerslivesmatter' }]
  });*/
  ngOnInit(): void {
    //this.reader.onload = e => this.imageSrc = this.reader.result;
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.storageService.getUser();
   /* this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.authToken=this.storageService.getTokent();
    this.uploader.onCompleteItem = (item: any, status: any) => {
      const data=JSON.parse(status)
      this.storageService.alterUser('profileImage',data.url)
      this.user=this.storageService.getUser();
      console.log('Uploaded File Details:', item);
      this.closeModel();
    };*/
      this.subscription2 = this.events.userdataEvent.subscribe(
        state=>{
          if(state.state==this.events.UPDATEUSER){
            this.user=state.userdata;
            this.roles=parseroles(this.user.roles) ;
            this.mainRole=getmainrole(this.roles);
            this.grade=parsegrade(this.user.grade);
          }
          if(state.state==this.events.DALETEUSER){
            this.user=state.userdata;
            this.roles=[];
            this.mainRole="";
            this.grade="";
          }
        }
      )
      /*this.events.updateEvent.subscribe(state => {
        if (state == this.events.UPDATEUSER) {
          this.user = this.storageService.getUser();
        }
      })*/
    
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }
  }

  showModel(ind:number){

    if(ind==1) this.modalEvent.next(1);    

  }
  showTab(ind:number){
    this.showenTab=ind;
    setTimeout(() => {
      this.showenTabFade=ind;
    }, 10);
  }

}