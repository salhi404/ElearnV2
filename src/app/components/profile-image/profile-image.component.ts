import { Component, ElementRef, HostListener, OnInit, ViewChild,Input } from '@angular/core';
import { User } from 'src/app/Interfaces/user';
import { StorageService } from 'src/app/_services/storage.service';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { parsegrade } from 'src/app/functions/parsers';
import { base64ToFile, Dimensions, ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent implements OnInit {
  @Input()user:User=null as any;
  imgoriginal: string = "";
  imgResult: string = "";
  imageUploadErr:boolean=false
  imageUploadErrMsg:string='';
  imageForm:any=null;
  fileName: string='';
  imageSrc: string | ArrayBuffer | null=null;
  modelShowen:boolean=false;
  fadeModel:boolean=false;
  eventsSubscription:Subscription= new Subscription;
  showCropper = false;
  croppedImage: any = '';
  imageChangedEvent:any='';
  file:File|null=null;
  reader = new FileReader();
  loading:boolean=false;
  previewImaurl='';
  deletedImage=false;
  blockHostListener=false;
  @Input() modalEvent: Observable<number>=null as any;
  formData: FormData|null=null;
  @ViewChild("modalDialog") modalDialog!: ElementRef;

  constructor(private imageCompress: NgxImageCompressService,private storageService: StorageService,private authService: AuthService,private events:EventsService) { }
  ngOnInit(): void {
    this.previewImaurl=this.user.profileImage;
    this.eventsSubscription = this.modalEvent.subscribe((state) => {
      if(state==1){
        console.log("opppppppppppppppen");
        this.blockHostListener=true;
        setTimeout(() => {
          this.blockHostListener=false;
        }, 300);
        this.modelShowen=true;
        setTimeout(() => {
        this.fadeModel=true;
        }, 10);
      }
      if(state==2){
        this.closeModel()
      }
    });
  }
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


uploadImage(){
    console.log("image upload");
    this.loading=true;
    if(this.deletedImage){
      this.authService.deleteprofileImage().subscribe({
        next:data=>{
          console.log(data);
          this.storageService.alterUser({profileImage:data.url});
          this.user.profileImage=data.url;
          this.previewImaurl=this.user.profileImage;
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
                  this.storageService.alterUser({profileImage:data.url})
                  this.user.profileImage=data.url;
                  this.previewImaurl=this.user.profileImage;
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
    }

    

  
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
this.deletedImage=false;
}
deleteImage(){
this.clearImage();
this.previewImaurl=this.user.fName[0].toUpperCase()+this.user.lName[0].toUpperCase();
this.deletedImage=true;
}

closeModel(){
  this.fadeModel=false;
  setTimeout(() => {
    this.modelShowen=false;
    this.clearImage();
  }, 150);
}

@HostListener('document:click', ['$event'])
clickout(event:any) {
  if(!this.modalDialog.nativeElement.contains(event.target)&&!this.blockHostListener){
    console.log('close');
    this.closeModel();    
  }
}

}
