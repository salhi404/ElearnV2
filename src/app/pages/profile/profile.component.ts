import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from 'src/app/Interfaces/user';
import { StorageService } from 'src/app/_services/storage.service';
import {  Router, NavigationExtras } from '@angular/router';
import { retry, Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { parsegrade } from 'src/app/functions/parsers';
//import { FileUploader } from 'ng2-file-upload'; 
import { base64ToFile, Dimensions, ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';

const URL_API = 'http://192.168.1.103:3000/'; 
const USERDATA_API = URL_API+'api/userdata/';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  imgoriginal: string = "";
  imgResult: string = "";
   formatBytes(a:number,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

  compressFile(resolve:any, reject:any) {
        const byteCount=this.imageCompress.byteCount(this.croppedImage);
        console.log("compress from ",this.formatBytes(byteCount) );
        if(byteCount>500000){
          this.imageCompress
          .compressFile(this.croppedImage,25, 25) // 50% ratio, 50% quality
          .then(
            (compressedImage) => {
              this.imgResult = compressedImage.slice();
              console.log("compress To ",this.formatBytes(this.imageCompress.byteCount(compressedImage)) );
              console.log(this.imgResult);
              resolve()
            }
          );
        }else{
          this.imgResult=this.croppedImage.slice();
          resolve();
        }
  }
  imageUploadErr:boolean=false
  imageUploadErrMsg:string='';
  imageForm:any=null;
  user:User=null as any;
  roles:string[]=[];
  mainRole:String='';
  userdetails:any={bio:''};
  subscription: Subscription = new Subscription;
  isLoggedIn:boolean=false;
  navigationExtras: NavigationExtras = { state: null as any };
  datepipe: DatePipe = new DatePipe('en-US');
  showenTab:number=0;
  showenTabFade:number=0;
  grade:string='';
  fileName: string='';
  imageSrc: string | ArrayBuffer | null=null;
  modelShowen:boolean=false;
  fadeModel:boolean=false;
  blockHostListener: boolean=false;
  showCropper = false;
  croppedImage: any = '';
  imageChangedEvent:any='';
  file:File|null=null;
  reader = new FileReader();
  loading:boolean=false;

  @ViewChild("modalDialog") modalDialog!: ElementRef;
  formData: FormData|null=null;
  constructor(private imageCompress: NgxImageCompressService,private storageService: StorageService,private authService: AuthService,private events:EventsService,private router: Router,) { }
 /* public uploader: FileUploader = new FileUploader({
    url: USERDATA_API+ 'profileImage',
    itemAlias: 'profileInput',
    headers: [{ name: 'foofoo', value: 'passengerslivesmatter' }]
  });*/
  ngOnInit(): void {
    this.reader.onload = e => this.imageSrc = this.reader.result;
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
    this.authService.getUserData('USERDETAILS').subscribe({
      next:data=>{
        console.log('USERDETAILS');
        console.log(data);  
        if(data.data)this.userdetails=data.data;     
      },
      error:err=>{
        console.log('USERDETAILS err');
        console.log(err);
      }
    })
    this.user=this.storageService.getUser();
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
      this.roles=this.user.roles.map(rl=>{switch (rl) {
        case "ROLE_USER":
          return 'Student';
        case "ROLE_MODERATOR":
          return 'Moderator';
        case "ROLE_ADMIN":
          return 'Admin';
      }
      return '';
    });
    this.mainRole=this.roles.includes('Admin')?'Admin':this.roles.includes('Moderator')?'Moderator':'Student';
    this.grade=parsegrade(this.user.grade);
    }else{
      this.navigationExtras={ state: {errorNbr:403} };
      this.router.navigate(['/error'],this.navigationExtras);
    }
  }
  getProfileInput(event:any){
    //this.clearImage();
    console.log("event");
    console.log(event);
    if(event.target.files[0].size>5000000){
      this.imageUploadErr=true;
      this.imageUploadErrMsg='image is too large (>5mb)';
    }else{
      this.imageChangedEvent=event;
      console.log(event.target.files[0].size);
    }
    /*this.file = event.target.files[0];
    if (this.file) {
        this.fileName = this.file.name;
        this.formData = new FormData();
        this.formData.append("thumbnail", this.file);
        console.log("formData");
        console.log(this.formData);
        this.reader.readAsDataURL(this.file);
    }*/
  }
  readImageEvent(event:any){
    this.file = event;
        if (this.file) {
        this.fileName = this.file.name;
        this.formData = new FormData();
        this.formData.append("thumbnail", this.file);
        console.log("formData");
        console.log(this.formData);
        this.reader.readAsDataURL(this.file);
    }
  }
  showModel(ind:number){
    this.blockHostListener=true;
    if(ind==1)this.modelShowen=true;
    setTimeout(() => {
      if(ind==1)this.fadeModel=true;
    }, 10);
    setTimeout(() => {
      this.blockHostListener=false;
    }, 300);
  }
  showTab(ind:number){
    this.showenTab=ind;
    setTimeout(() => {
      this.showenTabFade=ind;
    }, 10);
  }
  uploadImage(){
      console.log("image upload");
      this.loading=true;
      var promise = new Promise((resolve, reject) => { 
        this.compressFile(resolve, reject);
    }) 
    
    promise.then((success) => { 
            console.log(success); 
            if(this.imgResult!==''){
              console.log(this.imgResult);  
              this.authService.uploadImage(this.imgResult).subscribe({
                next:data=>{
                  console.log(data);
                  this.storageService.alterUser('profileImage',data.url)
                  this.user=this.storageService.getUser();
                  this.events.changeupdateState(this.events.UPDATEUSER);
                  this.loading=false;
                  this.closeModel();
                },
                error:err=>{
                  this.clearImage();
                  this.imageUploadErr=true;
                  this.imageUploadErrMsg='server error';
                  console.log(err);
                  this.loading=false;
                }
              });
            }else{
              this.imageUploadErr=true;
              this.imageUploadErrMsg='no image found';
            }

        }) 
        .catch((error) => { 
            console.log(error); 
        }); 
      

    
    //this.uploader.uploadAll();
    
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    console.log("croppedImage  trigerred");
    
    if(event.base64)console.log(event, base64ToFile(event.base64));
}

imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
}

cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
}

loadImageFailed() {
    console.log('Load failed');
}
clearImage(){
  this.imageUploadErr=false;
  this.imageUploadErrMsg='';
  this.formData=null;
  this.imageForm=null;
  this.fileName ='';
  this.imgResult='';
  this.imageSrc =null;
  this.showCropper = false;
  this.croppedImage='';
  this.imageChangedEvent='';
}
deleteImage(){
  
}
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(!this.modalDialog.nativeElement.contains(event.target)&&!this.blockHostListener){
      this.closeModel();
    }
  }
  closeModel(){
    this.fadeModel=false;
    
    setTimeout(() => {
      this.modelShowen=false;
      this.clearImage();
    }, 150);
  }
}
