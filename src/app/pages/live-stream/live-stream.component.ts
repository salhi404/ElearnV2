import { Component, OnInit } from '@angular/core';
// import { UserService } from '../../_services/user.service';
import { DatePipe } from '@angular/common';
import { StudentService } from "app/_services/student.service";

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
export class LiveStreamComponent implements OnInit {

  oppenedtab:number=1;
  datepipe: DatePipe = new DatePipe('en-US');
  allStreams:any[]=[];
  activeStreams:any[]=[];
  listedStreams:any[]=[];
  constructor(
    // private UserService:UserService,
    private StudentService:StudentService,
    ) {
  }

  ngOnInit() {
    this.getStreams();
  }
  getStreams(){
    this.StudentService.getStreams().subscribe({
      next:data=>{
        const now =new Date();
        if(data.livestreamsdata){
          this.allStreams=[];
          data.livestreamsdata.forEach((classStreams:any) => {
            classStreams.livestreams.forEach((stream:any) => {
              
              
              const start_timeDate =new Date(stream.start_time);
              console.log("ind : ",stream.indd);
              console.log("now : ",now);
              console.log("start_timeDate : ",start_timeDate);
              if(now.getTime()>start_timeDate.getTime() +(stream.duration+5)*60000){
                this.allStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:4,timestatus:'passed'})
              } else if(now.getTime()>start_timeDate.getTime() ){
                this.allStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:3,timestatus:'active'})
                this.activeStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:3,timestatus:'active'})
              }
              else if(now.getTime()>start_timeDate.getTime()  - 1200000){
                this.allStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:2,timestatus:'soon'})
                this.activeStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:2,timestatus:'soon'})
              }
              else {
                this.allStreams.push({...stream,classuuid:classStreams.classuuid,classname:classStreams.classname,timestatuscode:1,timestatus:this.getremainigTime(start_timeDate.getTime())})
              }
            });
          });
        }
        this.changeactive();
        console.log("getStreams data",data);
        
      },
      error:err=>{
        console.log("getStreams err",err);
      }
    })
  }
  getremainigTime(dateFuture:number):string{
    var dateNow = new Date().getTime();
    var seconds = Math.floor((dateFuture - (dateNow))/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);

    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    var str='';
    if(days>0)str+=str?'and ':'in '+ days+' days ';
    else{
      if(hours>0)str+=str?'and ':'in '+ hours+' hours ';
      if(minutes>0)str+=str?'and ':'in '+ minutes+' minutes ';
    }
    return str
  }
  oppenTab(ind:number){
    this.oppenedtab=ind;
    this.changeactive();
  }
  changeactive(){
    if(this.oppenedtab==1)
    this.listedStreams=this.allStreams;
    if(this.oppenedtab==2)
    this.listedStreams=this.activeStreams;
  }
  startMeeting(meeting:any){
    const url = window.location.origin+'/user/meeting?uuid='+meeting.classuuid+'&indd='+meeting.indd;
      window.open(url, "_blank");
  }
}
