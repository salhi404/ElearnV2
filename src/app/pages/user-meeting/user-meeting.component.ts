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
  @ViewChild('boardvideo', {static: true}) boardvideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('audio', {static: true}) audio!: ElementRef<HTMLVideoElement>;
  @ViewChild('camvideo', {static: true}) camvideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  client = ZoomMtgEmbedded.createClient();
  uuid = '';
  conn: any;
  indd: number = -1;
  params = { mode: -1, indd: -1, uuid: "" };
  info: any;
  peer: any;
  streamStatus: number = -1;
  connectionstatus: number = 0;
  disconnectType = 1;
  connectingTimeOut: any;
  call = { boardConnection: undefined as any,boardMedia:null as any, audioConnection: undefined as any,audioMedia:null as any,videoConnection: undefined as any,videoMedia:null as any, dataConnection: undefined as DataConnection | undefined };
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
    this.connectionstatus = 0;
    this.StudentService.startStream(params).subscribe({
      next: data => {
        console.log("start data ", data);
        this.info = data.info;
        this.streamStatus = this.info.status
        if (this.info.status == 1) {
          this.params.mode = this.info.mode;
          this.peer = new Peer();
          console.log(' startWboardStream this.peer', this.peer);
          this.peer.on('open', (id: any) => {
            if (this.info.peer) {
              //   console.log(' trying to connenct to ', info.peer);
              //   this.conn = this.peer.connect(info.peer);
              // this.conn.on('open', ()=>{
              // this.conn.send('Message from that id');
              // console.log(" this.conn open");
              this.connect()
              // });
            }//, { metadata: info.user }
            else { console.log("peer recieved is empty"); }
          });

          // switch (this.info.mode) {
          //   case 1:
          //     this.startWboardStream(this.info)
          //     break;
          //   case 2:
          //     this.startScreenStream(this.info)
          //     break;
          //   case 3:
          //     // this.initiateZoom();
          //     this.startZoomStream(this.info);
          //     break;
          // }
        } else {
          this.waitStream();
        }

      },
      error: err => {
        console.log('error in start ', err)
      }
    })
  }
  connect() {
    console.log("connect() to ",this.info.peer);
    this.call.dataConnection = this.peer.connect(this.info.peer, { metadata:{ ...this.info.user,peer:this.peer.id} });
    this.connectionstatus = 1;
    // this.connectingTimeOut = setTimeout(() => {
    //   if (!this.call.dataConnection!.open) {
    //     this.connectionstatus = 3;
    //   }
    // }, 10000);
    this.call.dataConnection!.on('open', () => {
      this.connectionstatus = 2;
      clearTimeout(this.connectingTimeOut)
      this.call.dataConnection!.on('data', (data) => {
        console.log("resieved Data ", data);
        this.processConnData(data)
      });
      this.resieveHostCall()
    });
    this.call.dataConnection!.on('close', () => {
      console.log('close');
      this.disconnect()
    });
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
  drawcircle() {
    var ctx = this.canvas.nativeElement.getContext("2d");
    ctx!.beginPath();
    ctx!.arc(this.getRandomInt(500), this.getRandomInt(200), this.getRandomInt(100), 0, 2 * Math.PI);
    ctx!.stroke();
  }
  // callHost(){
  //   console.log("calling Host");
  //   if(isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
  //     // navigator.mediaDevices.getUserMedia({video: true, audio: true}).
  //     navigator.mediaDevices.getUserMedia({
  //       audio: true, 
  //       video: true, //{ mediaSource: "screen"}
  //   }).
  //     then((ms: MediaStream) => {
  //       console.log("media stream ",ms);
  //       this.call.myMedia=ms;
  //       this.call.mediaConnection = this.peer.call(this.info.peer,this.call.myMedia, { metadata: {...this.info.user,connectionId:this.call.dataConnection?.connectionId} });
  //       // const _video = this.video.nativeElement;
  //       // _video.srcObject = ms;
  //       // _video.play();
  //       this.call.mediaConnection.on('stream', (remotestream:any) =>{
  //         console.log("stream Recieved");
  //         this.call.media =remotestream;
  //         const _video = this.boardvideo.nativeElement;
  //         _video.srcObject = remotestream;
          
  //         var playPromise = _video.play();
  
  //         if (playPromise !== undefined) {
  //           playPromise.then(_ => {
  //             // Automatic playback started!
  //             // Show playing UI.
  //           })
  //           .catch((error:any) => {
  //             // Auto-play was prevented
  //             // Show paused UI.
  //           });
  //         }
        
  //       console.log("Media Recieved this.call.media =",this.call.media);
        
  //       })
        
  //     }).catch(function(err) {
  //      console.log("media permission error ",err);
       
  //   });
  //   }else{
  //     console.log("isPlatformBrowser is false"); 
  //   }
  //   // var ctx = this.canvas.nativeElement.getContext("2d");
  //   // ctx!.fillStyle = "white";
  //   // ctx!.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  //   // let media = this.canvas.nativeElement.captureStream(25);
  //   // setInterval(() => {
  //   //   this.drawcircle();
  //   // }, 1500);
  //   // this.call.mediaConnection = this.peer.call(this.info.peer,media, { metadata: {...this.info.user,connectionId:this.call.dataConnection?.connectionId} });
  //   // this.call.mediaConnection.on('stream', (remotestream:any) =>{
  //   //   // console.log("stream Recieved with tracks : ",remotestream.getTracks());
  //   //   this.call.media =remotestream;
  //   //   let _video = this.video.nativeElement;
  //   //   _video.srcObject = remotestream as MediaProvider;
  //   //   var playPromise = _video.play();
    
  //   // console.log("Media Recieved this.call.media =",this.call.media);
    
  //   // })
   
  // }
  resieveHostCall(){
    this.peer.on('call', (Mediaconn: any) => {
      console.log("call recieaved ", Mediaconn);
      var ctx = this.canvas.nativeElement.getContext("2d");
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      let media = this.canvas.nativeElement.captureStream(25);
      setInterval(() => {
        this.drawcircle();
      }, 1500);
      if(Mediaconn.metadata.type==1){
        this.call.boardConnection=Mediaconn;
        Mediaconn.on('stream', (remotestream: any) => {
          console.log("boardConnection remotestream",remotestream);
          this.connectionstatus = 5;
          this.call.boardMedia=remotestream;
          const _video = this.boardvideo.nativeElement;
          _video.srcObject = this.call.boardMedia;
           _video.play();
        })
      }
      if(Mediaconn.metadata.type==2){
        this.call.audioConnection=Mediaconn;
        Mediaconn.on('stream', (remotestream: any) => {
          console.log("audioConnection remotestream",remotestream);
          this.connectionstatus = 5;
          this.call.audioMedia=remotestream;
          const _video = this.audio.nativeElement;
          _video.srcObject = this.call.audioMedia;
          _video.play();
        })
      }
      if(Mediaconn.metadata.type==3){
        this.call.videoConnection=Mediaconn;
        Mediaconn.on('stream', (remotestream: any) => {
          console.log("videoConnection remotestream",remotestream);
          this.connectionstatus = 5;
          this.call.videoMedia=remotestream;
          const _video = this.camvideo.nativeElement;
          _video.srcObject = this.call.videoMedia;
          _video.play();
        })
      }
      Mediaconn.answer(media)


      // if (isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
      //   navigator.mediaDevices.getUserMedia({
      //     audio: true,
      //     video: false,
      //   }).
      //     then((ms: MediaStream) => {
      //       console.log("media stream ", ms);
      //       Mediaconn.answer(ms) 
      //     }).catch(function (err) {
      //       console.log("media permission error ", err);
      //     });
      // } else {
      //   console.log("isPlatformBrowser is false");
      // }

      

      
    });
  }
  processConnData(data: any) {
    switch (data.task) {
      case 1:

        break;
      case 5:
        this.disconnectType = 2;
        break;
      default:
        break;
    }
  }
  disconnect() {
    clearTimeout(this.connectingTimeOut);
    this.connectionstatus = 4;
  }
  waitStream() {
    console.log("stream didn't start yet");
    this.streamStatus = 0;
  }
  startWboardStream(info: any) {
    this.peer = new Peer();
    console.log(' startWboardStream this.peer', this.peer);
    this.peer.on('open', (id: any) => {
      if (info.peer) {
        //   console.log(' trying to connenct to ', info.peer);
        //   this.conn = this.peer.connect(info.peer);
        // this.conn.on('open', ()=>{
        // this.conn.send('Message from that id');
        // console.log(" this.conn open");

        // });
        this.call.dataConnection = this.peer.connect(info.peer, { metadata: info.user });
        console.log("this.call.dataConnection.on('open')");
        this.call.dataConnection!.on('open', () => {
          console.log('connection established 1');
          console.log("this.call.dataConnection.on('data')");
          this.call.dataConnection!.on('data', (data) => {
            console.log('Received', data);
          });
        });

      }//, { metadata: info.user }
      else { console.log("peer recieved is empty"); }
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
