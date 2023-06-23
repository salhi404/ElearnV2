import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, HostListener, PLATFORM_ID } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from 'app/_services/teacher.service';
import { DataConnection, Peer } from "peerjs";
import { SlideboardComponent } from '../slideboard/slideboard.component';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, AfterViewInit {
  params = { mode: -1, indd: -1, uuid: "" };
  mediaConnection1: any;
  info: any;
  //  ------------------ zoom ------------------  //  
  @ViewChild("meetingSDKElement") meetingSDKElement!: ElementRef;
  @ViewChild("SlideboardComponent") SlideComp!: SlideboardComponent;
  @ViewChild("slideContainer") slideContainer!: ElementRef;
  @ViewChild('video', {static: true}) video!: ElementRef<HTMLVideoElement>;
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
  students:any[]=[];
  eventsLog: string = "";
  dataRecieved: string = "";
  stream={
    video:undefined as MediaStream | undefined,
    audio:undefined as MediaStream | undefined,
  }
  constructor(
    @Inject(PLATFORM_ID) private _platform: Object,
    private UserService: UserService,
    private route: ActivatedRoute,
    private teacherservice: TeacherService,) {
  }
  ngAfterViewInit() {
    this.initiateZoom();
    this.resizeCanvase(null);
    
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
    this.teacherservice.startStream(/*{ ..., peer: id }*/params).subscribe({
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
  getStreams(type:number) {

    this.stream.video=this.SlideComp.whiteboardComp.canvasElement?.nativeElement.captureStream(25);
    console.log("this.stream.video",this.stream.video);
    
    const _video = this.video.nativeElement;
          _video.srcObject = this.stream.video as MediaProvider;
         _video.srcObject =  this.SlideComp.whiteboardComp.canvasElement?.nativeElement.captureStream(25);
          var playPromise = _video.play();
    if(isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: false, 
    }).
      then((ms: MediaStream) => {
        console.log("media stream ",ms);
        this.stream.audio=ms;
        this.stream.video!.addTrack(this.stream.audio.getTracks()[0])
      }).catch(function(err) {
       console.log("media permission error ",err);
       
    });
    }else{
      console.log("isPlatformBrowser is false");
      
    }
 
}
  startWboardStream(info: any) {
    //"f5c5c07e-5f07-4ff6-b629-991129d02b23"
    this.getStreams(1);

    console.log(' startWboardStream this.peer', this.peer);
    if (info.whiteboard) {
      this.SlideComp.form = {
        name: info.whiteboard.name,
        pages: this.addSecSvgToPages(info.whiteboard.pages),//2023-03-22T00:31
        pagesCount: info.whiteboard.pagesCount
      }

    }
    else {
      this.SlideComp.form = {
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
    this.peer = new Peer(info.peer)//("42d61575-a1fe-401b-9157-7b93cdb01e7c");
    this.peer.on('open', (id: any) => {
      console.log("id recieved is : ", id);
      this.peer.on('connection', (conn: DataConnection) => {
        console.log("connection recieaved ", conn);
        this.connectUser({info:conn.metadata,connection:conn})
        // this.eventsLog += " ...  connection recieaved  : " + conn
        conn.on('data', (data: any) => {
          // this.dataRecieved += data
          // Will print 'hi!'
          // this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
          //     fabric.log(o, object);
          //   });
          // if (this.dataContainer) this.dataContainer.nativeElement.innerHTML = data;
          console.log("data recieved", data);
        });
      });
      this.peer.on('call', (Mediaconn: any) => {
        console.log("call recieaved ", Mediaconn);
        this.answerUser(Mediaconn);
      });
    });

  }
  answerUser(Mediaconn: any) {
    if(Mediaconn.metadata){
      const findUser = this.students.find((item:any)=>item.info.email===Mediaconn.metadata.email&&item.connection.connectionId===Mediaconn.metadata.connectionId);
      if(findUser){
        findUser.Mediaconn = Mediaconn;
        findUser.Mediaconn.answer(this.stream.video);
      }
    }

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
connectUser(user:any){
  console.log("connectUser :",user);
  // if(test_user){
  //   user.connection.close()
  // }else{

  // }
  const tempitem = this.students.find((item:any)=>item.info.email===user.info.email)
  if(tempitem){
    tempitem.connection.close()
  }
  this.students.push({...user});
  user.connection.send({
    task:1,
  })
  user.connection.on('close', () => {
    this.disconnectUser(user.info.email+"",user.connection.connectionId+"")
  });

}
disconnectUser(email:string,connectionId:string){
  const tempind = this.students.findIndex((item:any)=>item.info.email===email&&item.connection.connectionId===connectionId)
  if(tempind!=-1){
    console.log("user disconnected : ",this.students[tempind]);
    this.students.splice(tempind,1)
  }
}
sendDataTo(ind:number){
  this.students[ind].connection.send("daaaaaaaaaaata") 
}
  //  ------------------ peer ------------------  //
  initiatePeer(peerId: string) {
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
  addSecSvgToPages(Pages: any): any {
    return Pages.map((elem: any) => { return { json: elem.json, svg: elem.svg, secSvg: this.SlideComp.sanitizer.bypassSecurityTrustHtml(elem.svg) } });
  }
  @HostListener('window:resize', ['$event'])
  resizeCanvase(event: any) {
    // this.SlideComp.whiteboardComp.setSize(width,height);
    setTimeout(() => {
      const width = this.slideContainer.nativeElement.offsetWidth;
      this.SlideComp.whiteboardComp.setSize(width);
    }, 500);

  }
}