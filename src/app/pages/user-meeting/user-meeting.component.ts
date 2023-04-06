import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { StudentService } from "app/_services/student.service";

@Component({
  selector: 'app-user-meeting',
  templateUrl: './user-meeting.component.html',
  styleUrls: ['./user-meeting.component.scss']
})
export class UserMeetingComponent implements OnInit, AfterViewInit{

  constructor(
    private UserService:UserService,
    private route: ActivatedRoute,
    private StudentService:StudentService,
    ) {
  }
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  client = ZoomMtgEmbedded.createClient();
  uuid='';
  indd:number=-1;
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
  getSignature() {
    this.StudentService.getsignature(this.uuid,this.indd).subscribe({
      next: data => {
        console.log("getSignature data ",data);
        if(data.signature&&data.info) {
          // this.zakToken=data.info.zakToken;
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
      // userEmail: info.host_email,
      // tk: '',//info.registrantToken,
      // zak:'eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6ImRGRGxzUkRvU1RPVVF5Um1XcThJUEEiLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEsIndjZCI6InVzMDQiLCJjbHQiOjAsImV4cCI6MTY4MDEzOTM5NSwiaWF0IjoxNjgwMTMyMTk1LCJhaWQiOiIzVzJrX2FCR1ItQzNsdnJmUXdqTUVBIiwiY2lkIjoiIn0.2lVV46XWA-1bmb_fCKz-gXnDQ3n-o5CoNcf2lRyeQ5A' //info.zakToken
    })
  }
}
