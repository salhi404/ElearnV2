import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { StudentService } from "app/_services/student.service";
import { DataConnection, Peer } from "peerjs";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-meeting',
  templateUrl: './user-meeting.component.html',
  styleUrls: ['./user-meeting.component.scss']
})
export class UserMeetingComponent implements OnInit, AfterViewInit {

  constructor(
    @Inject(PLATFORM_ID) private _platform: Object,
    private UserService: UserService,
    private route: ActivatedRoute,
    private StudentService: StudentService,
  ) {
  }
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  client = ZoomMtgEmbedded.createClient();
  uuid = '';
  indd: number = -1;
  params = { mode: -1, indd: -1, uuid: "" };
  info: any;
  peer: any;
  streamStatus: number = -1;
  call = { mediaConnection: undefined as any, media: undefined as any, dataConnection: undefined as DataConnection | undefined };
  ngOnInit() {
    this.route.queryParams
      .subscribe((params: any) => {
        console.log("params", params);
        if (params.indd && params.uuid) {
          this.params = this.parseParams({ ...params, mode: -1 })
          // window.location.href=window.location.origin+'/teacher/meeting';
          this.start(this.params);
        }
      }
      );
  }
  ngAfterViewInit() {
    this.initiateZoom();
  }
  parseParams(params: any): any {
    let params1: any = {
      mode: +params.mode,
      indd: +params.indd,
      uuid: params.uuid,
    }
    if (params.Wboard) params1.Wboard = +params.Wboard;
    return params1;
  }
  start(params: any) {
    // switch (params.mode) {
    //   case 1:
    //     this.startWboardStream(params)
    //     break;
    //   case 2:
    //     this.startScreenStream(params)
    //     break;
    //   case 3:
    //     // this.initiateZoom();
    //     this.startZoomStream(params);
    //     break;
    // }
    this.StudentService.startStream(params).subscribe({
      next: data => {
        console.log("start data ", data);
        this.info = data.info;
        this.streamStatus = this.info.status
        if (this.info.status == 1) {
          switch (this.info.mode) {
            case 1:
              this.startWboardStream(this.info)
              break;
            case 2:
              this.startScreenStream(this.info)
              break;
            case 3:
              // this.initiateZoom();
              this.startZoomStream(this.info);
              break;
          }
        } else {
          this.waitStream();
        }

      },
      error: err => {
        console.log('error in start ', err)
      }
    })
  }

  waitStream() {
    console.log("stream didn't start yet");
    this.streamStatus = 0;
  }
  startWboardStream(info: any) {
    this.peer = new Peer();
    console.log(' startWboardStream this.peer', this.peer);
    console.log(' trying to connenct to ', info.peer);
    this.call.dataConnection = this.peer.connect(info.peer);//, { metadata: info.user }
    this.call.dataConnection!.on('open', () => {
      console.log('connection established 1');
      this.call.dataConnection!.on('data', (data) => {
        console.log('Received', data);
      });
    });


    // if (isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
    //   navigator.mediaDevices.getDisplayMedia({
    //     audio: true,
    //     // video: true, //{ mediaSource: "screen"}
    //   }).
    //     then((ms: MediaStream) => {
    //       this.call.mediaConnection = this.peer.call(info.peer, ms);
    //       this.call.mediaConnection.on('stream', (remotestream: any) => {
    //         this.call.media =remotestream;
    //         console.log("remote stream", this.call.media);
    //       })
    //     });
    // } else {
    //   console.log("isPlatformBrowser is false");

    // }
    // this.peer.on('connection', (conn: any) => {
    //   conn.on('data', (data: any) => {
    //     // Will print 'hi!'
    //     // this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
    //     //     fabric.log(o, object);
    //     //   });
    //     // if (this.dataContainer) this.dataContainer.nativeElement.innerHTML = data;
    //     // console.log(data);
    //   });
    // });
  }
  startScreenStream(info: any) {
    this.peer = new Peer();
    console.log(' startScreenStream this.peer', this.peer);
    this.peer.call(info.peer,)
    this.peer.on('connection', (conn: any) => {
      conn.on('data', (data: any) => {
        // Will print 'hi!'
        // this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
        //     fabric.log(o, object);
        //   });
        // if (this.dataContainer) this.dataContainer.nativeElement.innerHTML = data;
        // console.log(data);
      });
    });
  }
  startZoomStream(info: any) {
    this.getSignature(this.params.uuid, this.params.indd)
  }
  initiateZoom() {
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
  getSignature(uuid: string, indd: number) {
    this.StudentService.getsignature(uuid, indd).subscribe({
      next: data => {
        console.log("getSignature data ", data);
        if (data.signature && data.info) {
          // this.zakToken=data.info.zakToken;
          console.log(data.signature)
          this.startMeeting(data.signature, data.info)
          console.log("fire startMeeting with : data ", data.info);
          console.log("and signature ", data.signature);
        } else {
          console.log(data)
        }
      },
      error: err => {
        console.log('error in getSignature ', err)
      }
    })
  }
  startMeeting(signature: any, info: any) {
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
