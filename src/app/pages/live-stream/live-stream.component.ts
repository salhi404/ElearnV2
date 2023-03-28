import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UserService } from '../../_services/user.service';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
  // ZoomMtg.setZoomJSLib('https://source.zoom.us/2.10.1/lib', '/av');

  // ZoomMtg.preLoadWasm();
  // ZoomMtg.prepareWebSDK();
  // // loads language files, also passes any error messages to the ui
  // ZoomMtg.i18n.load('en-US');
  // ZoomMtg.i18n.reload('en-US');
@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss',
  // './css/bootstrap.css','./css/react-select.css'
]
})
export class LiveStreamComponent implements OnInit, AfterViewInit {
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  sdkKey = 'Qe0zJgNzQDqU3u5tJk1sdQ'
  meetingNumber = '123456789'
  passWord = ''
  role = 0
  userName = 'Angular'
  userEmail = ''
  registrantToken = ''
  zakToken = ''
  client = ZoomMtgEmbedded.createClient();
  code:string=''; 
  constructor(private UserService:UserService,private route: ActivatedRoute) {

  }
  ngAfterViewInit() {
    let meetingSDKElement = this.meetingSDKElement.nativeElement as HTMLElement;

    this.client.init({
      debug: true,
      zoomAppRoot: meetingSDKElement!,
      language: 'en-US',
      customize: {
        meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
        toolbar: {
          buttons: [
            {
              text: 'Custom Button',
              className: 'CustomButton',
              onClick: () => {
                console.log('custom button');
              }
            }
          ]
        }
      }
    });
  }
  ngOnInit() {
    this.route.queryParams
    .subscribe((params:any) => {
      console.log(params); // { code: "price" }
      this.code = params.code||'';
      if(this.code){
        this.UserService.getaccestoken(this.code).subscribe({
          next: data => {
            console.log("getaccestoken data ",data);
          },
          error: err => {
            console.log('error in getaccestoken ',err)
          }
        })
      }
    }
  );
  }
  getToken(){
    window.location.href='https://zoom.us/oauth/authorize?response_type=code&client_id=Qe0zJgNzQDqU3u5tJk1sdQ&redirect_uri=https://salhisite.web.app/liveStreams' //' https://zoom.us/oauth/token?response_type=code&client_id=Qe0zJgNzQDqU3u5tJk1sdQ&redirect_uri=http://localhost:4200/liveStreams';
  }
  CreateMeeting(){
    this.UserService.CreateMeeting().subscribe({
      next: data => {
        console.log("CreateMeeting data ",data);
      },
      error: err => {
        console.log('error in CreateMeeting ',err)
      }
    })
  }
  getSignature() {
    this.UserService.getsignature(this.meetingNumber,this.role).subscribe({
      next: data => {
        console.log("getSignature data ",data);
        
        if(data.signature) {
          console.log(data.signature)
          this.startMeeting(data.signature)
        } else {
          console.log(data)
        }
      },
      error: err => {
        console.log('error in getSignature ',err)
      }
    })
  }

  startMeeting(signature: any) {

    this.client.join({
      signature: signature,
    	sdkKey: this.sdkKey,
    	meetingNumber: this.meetingNumber,
    	password: this.passWord,
    	userName: this.userName,
      userEmail: this.userEmail,
      tk: this.registrantToken,
      zak: this.zakToken
    })
  }
}
