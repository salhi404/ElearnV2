import { Component, OnInit,OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import { Peer } from "peerjs";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit,OnDestroy {
  @ViewChild('myvideo') myVideo: any;
  
  peer:any;
  anotherid:any;
  mypeerid:any;
  
  @ViewChild('video', {static: true}) video!: ElementRef<HTMLVideoElement>;
  constructor(@Inject(PLATFORM_ID) private _platform: Object) {}

  onStart(){
    // if(isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
    //   navigator.mediaDevices.getUserMedia({video: true}).then((ms: MediaStream) => {
    //     const _video = this.video.nativeElement;
    //     _video.srcObject = ms;
    //     _video.play(); 
    //   });
    // }else{
    //   console.log("isPlatformBrowser is false");
      
    // }
  }

  onStop() {
    // this.video.nativeElement.pause();
    // (this.video.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
    // this.video.nativeElement.srcObject = null;
  }

  ngOnDestroy() {
    (this.video.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
  }
  
  ngOnInit() {
    // let video = this.myVideo.nativeElement;
    this.peer = new Peer();
    console.log('this.peer',this.peer);
    
    setTimeout(() => {
      this.mypeerid = this.peer.id;
      console.log('this.peer',this.peer);
    },3000);
    
    this.peer.on('connection', (conn:any)=> {
  conn.on('data', (data:any)=>{
    // Will print 'hi!'
    console.log(data);
  });
});

    this.peer.on('call', (call:any) => {
       call.answer();
      console.log("call",call);
      call.on('stream', (remotestream:any)=>{
        console.log("remotestream",remotestream);
        
        // video.src = URL.createObjectURL(remotestream);
        // video.play();
        const _video = this.video.nativeElement;
        _video.srcObject = remotestream;
        
        var playPromise = _video.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Automatic playback started!
            // Show playing UI.
          })
          .catch(error => {
            // Auto-play was prevented
            // Show paused UI.
          });
        }
      })

      // if(isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
      //   navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream: MediaStream) => {
      //     // const _video = this.video.nativeElement;
      //     // _video.srcObject = ms;
      //     // _video.play(); 
          
      //   });
      // }
    })
  }
  
  connect(){
    var conn = this.peer.connect(this.anotherid);
conn.on('open', function(){
  conn.send('Message from that id');
});
  }
  
  videoconnect(){




    // let video = this.myVideo.nativeElement;
    var localvar = this.peer;
    var fname = this.anotherid;
    
    //var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    // var n = <any>navigator;
    
    // n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia  || n.msGetUserMedia );
    if(isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((ms: MediaStream) => {
        var call = localvar.call(fname, ms);
        // const _video = this.video.nativeElement;
        // _video.srcObject = ms;
        // _video.play();
        call.on('stream', (remotestream:any) =>{
          // video.src = URL.createObjectURL(remotestream);
          // video.play();


        //   const _video = this.video.nativeElement;
        // _video.srcObject = remotestream;
        // _video.play(); 
        console.log("remotestream",remotestream);
        
        })
        
      });
    }else{
      console.log("isPlatformBrowser is false");
      
    }
    // n.getUserMedia({video: true, audio: true}, function(stream:any) {

    // }, function(err:any){
    //   console.log('Failed to get stream', err);
    // })
    
    
  }
}
