import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from 'app/_services/teacher.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, AfterViewInit {
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  // sdkKey = 'Qe0zJgNzQDqU3u5tJk1sdQ'
  // meetingNumber = '74647496286'
  // passWord = '123456'
  // role = 1
  // userName = 'Angular'
  // userEmail = ''
  // registrantToken = ''
  zakToken = ''
  client = ZoomMtgEmbedded.createClient();
  uuid='';
  indd:number=-1;
  constructor(
    private UserService:UserService,
    private route: ActivatedRoute,
    private teacherservice: TeacherService,
    ) {
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
      this.uuid = params.uuid||'';
      this.indd = params.indd||-1;
      if(this.uuid){
        this.getSignature();
      }
    }
  );
  }
  getSignature() {
    this.teacherservice.getsignature(this.uuid,this.indd).subscribe({
      next: data => {
        console.log("getSignature data ",data);
        if(data.signature&&data.info) {
          this.zakToken=data.info.zakToken;
          console.log(data.signature)
          this.startMeeting(data.signature,data.info)
          console.log("fire startMeeting with : data ",data.info);
          console.log("and signature ",data.signature);
        } else {
          console.log(data)
        }
      },
      error: err => {
        console.log('error in getSignature ',err)
      }
    })
  }
  startMeeting(signature: any,info:any) {
    this.client.join({
      signature: signature,
    	sdkKey: info.sdkKey,
    	meetingNumber: info.id,
    	password: info.password,
    	userName: info.userName,
      userEmail: info.host_email,
      tk: '',//info.registrantToken,
      zak: info.zakToken
    })
  }
}
