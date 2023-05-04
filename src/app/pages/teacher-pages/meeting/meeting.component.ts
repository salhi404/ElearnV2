import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from 'app/_services/teacher.service';
import { Peer } from "peerjs";
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
  
//  ------------------ peer ------------------  //
  conn: any;
  peer: any;
  anotherid: any;
  mypeerid: any;
  attempt: number = 0;
  constructor( private UserService:UserService, private route: ActivatedRoute, private teacherservice: TeacherService, ) {
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

//  ------------------ peer ------------------  //
  this.peer = new Peer();
    console.log('this.peer', this.peer);
    this.getPeerId();
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
  getPeerId() {
    setTimeout(() => {
      if (this.peer.id || this.attempt > 25) {
        this.mypeerid = this.peer.id;
      } else {
        this.attempt++;
        this.getPeerId();
      }
      console.log('attempt : ' + this.attempt + '  this.peer  :', this.peer);
    }, 500);
  }
  canvasModifiedCallback(): any {
    console.log("connection", this.conn);
    return () => {
      // console.log('canvas modified!', connection);
      // if (connection)connection.send(this.canvas.toJSON())
      // if (this.conn) this.conn.send(this.canvas.toSVG())
    }

    // if (connection)connection.send(this.canvas.toJSON());
  };
  send() {
    console.log('canvas modified!', this.conn);
    // if (this.conn) this.conn.send(this.canvas.toSVG())
  }
  connect() {
    this.conn = this.peer.connect(this.anotherid);
    this.conn.on('open', () => {
      // this.conn.send('Message from that id');
    });
    // this.canvas.on('object:added', this.canvasModifiedCallback());
    // this.canvas.on('object:removed', this.canvasModifiedCallback());
    // this.canvas.on('object:modified', this.canvasModifiedCallback());
    // this.canvas.on('object:moving', this.canvasModifiedCallback());
    // this.canvas.on('object:scaling', this.canvasModifiedCallback());
    // this.canvas.on('object:rotating', this.canvasModifiedCallback());
    // this.canvas.on('object:skewing', this.canvasModifiedCallback());
    // this.canvas.on('object:resizing', this.canvasModifiedCallback());
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
