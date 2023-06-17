import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, HostListener, PLATFORM_ID } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from 'app/_services/teacher.service';
import { DataConnection, Peer } from "peerjs";
import { SlideboardComponent } from '../slideboard/slideboard.component';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, AfterViewInit {
  params = {mode: -1,indd: -1,uuid:""};
  mediaConnection1: any ;
  info: any;
  //  ------------------ zoom ------------------  //  
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  @ViewChild("SlideboardComponent") SlideComp!: SlideboardComponent;
  @ViewChild("slideContainer") slideContainer!: ElementRef;
  // sdkKey = 'Qe0zJgNzQDqU3u5tJk1sdQ'
  // meetingNumber = '74647496286'
  // passWord = '123456'
  // role = 1
  // userName = 'Angular'
  // userEmail = ''
  // registrantToken = ''
  zakToken = ''
  client = ZoomMtgEmbedded.createClient();

  //  ------------------ peer ------------------  //
  conn: any;
  peer: any;
  anotherid: any;
  mypeerid: any;
  attempt: number = 0;
  eventsLog:string="";
  dataRecieved:string="";
  constructor(
    @Inject(PLATFORM_ID) private _platform: Object,
    private UserService: UserService, 
    private route: ActivatedRoute, 
    private teacherservice: TeacherService,) {
  }
  ngAfterViewInit() {
    this.initiateZoom();
    this.resizeCanvase(null)
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
  ngOnInit() {
    this.route.queryParams
      .subscribe((params: any) => {
        console.log("params", params);
        if (params.mode && params.indd && params.uuid) {
          this.params = this.parseParams(params)
          // window.location.href=window.location.origin+'/teacher/meeting';
          this.start(this.params);
        }
      }
      );
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
    this.teacherservice.startStream(params).subscribe({
      next: data => {
        console.log("start data ", data);
        this.info = data.info;
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
      },
      error: err => {
        console.log('error in start ', err)
      }
    })
  }
  startWboardStream(info: any) {
    this.peer = new Peer(info.peer);//"f5c5c07e-5f07-4ff6-b629-991129d02b23"
    console.log(' startWboardStream this.peer', this.peer);
    if(info.whiteboard){
      this.SlideComp.form = {
        name: info.whiteboard.name,
        pages: this.addSecSvgToPages(info.whiteboard.pages),//2023-03-22T00:31
        pagesCount: info.whiteboard.pagesCount
      }

    }
    else{
      this.SlideComp.form ={
        name: 'New',
        pages: [{
          json: this.SlideComp.whiteboardComp.canvas.toJSON(), svg: this.SlideComp.whiteboardComp.canvas.toSVG(),
          secSvg: this.SlideComp.sanitizer.bypassSecurityTrustHtml(this.SlideComp.whiteboardComp.canvas.toSVG()),
        }],
        pagesCount: 1,
      }
    }
    this.SlideComp.currentPage = 0;
    this.SlideComp.chooseSlide(0);
    // this.getPeerId();
    this.peer.on('connection', (conn: DataConnection) => {
      console.log("connection recieaved ",conn);
      this.eventsLog+=" ...  connection recieaved with metadata : "+conn.metadata
      
      conn.on('data', (data: any) => {
        this.dataRecieved+=data
        // Will print 'hi!'
        // this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
        //     fabric.log(o, object);
        //   });
        // if (this.dataContainer) this.dataContainer.nativeElement.innerHTML = data;
        console.log("data recieved",data);
      });
    });
  }
  startScreenStream(info: any) {
    this.peer = new Peer(info.peer);//"f5c5c07e-5f07-4ff6-b629-991129d02b23"
    console.log(' startScreenStream this.peer', this.peer);
    // this.getPeerId();
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

  //  ------------------ peer ------------------  //
  initiatePeer(peerId:string) {
    this.peer = new Peer(peerId);//"f5c5c07e-5f07-4ff6-b629-991129d02b23"
    console.log('this.peer', this.peer);
    // this.getPeerId();
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
  // getPeerId() {
  //   setTimeout(() => {
  //     if (this.peer.id || this.attempt > 25) {
  //       this.mypeerid = this.peer.id;
  //     } else {
  //       this.attempt++;
  //       this.getPeerId();
  //     }
  //     console.log('attempt : ' + this.attempt + '  this.peer  :', this.peer);
  //   }, 500);
  // }
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
  getSignature(uuid: string, indd: number) {
    this.teacherservice.getsignature(uuid, indd).subscribe({
      next: data => {
        console.log("startZoomStream data ", data);
        if (data.signature && data.info) {
          this.zakToken = data.info.zakToken;
          console.log(data.signature)
          this.joinzoomMeeting(data.signature, data.info)
          console.log("fire startMeeting with : data ", data.info);
          console.log("and signature ", data.signature);
        } else {
          console.log(data)
        }
      },
      error: err => {
        console.log('error in startZoomStream ', err)
      }
    })
  }

  joinzoomMeeting(signature: any, info: any) {
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
  addSecSvgToPages(Pages:any):any{
    return Pages.map((elem:any)=>{return {json:elem.json,svg:elem.svg,secSvg:this.SlideComp.sanitizer.bypassSecurityTrustHtml(elem.svg)}});
  }
  @HostListener('window:resize', ['$event'])
  resizeCanvase(event: any) {
      // this.SlideComp.whiteboardComp.setSize(width,height);
      setTimeout(() => {
        const width = this.slideContainer.nativeElement.offsetWidth ;
        this.SlideComp.whiteboardComp.setSize(width);
      }, 500);

}
}