import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
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
  meetingNumber = '74647496286'
  passWord = '123456'
  role = 1
  userName = 'Angular'
  userEmail = ''
  registrantToken = ''
  zakToken = 'dFDlsRDoSTOUQyRmWq8IPA'
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
