import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { TeacherService } from 'app/_services/teacher.service';
import { StorageService } from 'app/_services/storage.service';
import { DatePipe } from '@angular/common';
import { Peer } from "peerjs";
// import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-teacher-live-stream',
  templateUrl: './teacher-live-stream.component.html',
  styleUrls: ['./teacher-live-stream.component.scss']
})
export class TeacherLiveStreamComponent implements OnInit {
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  activeCard: number = 0;
  activePanel: number = 0;
  loading: boolean = false;
  chosenClass: any = null;
  chosenlivestream: any = null;
  peer: any;
  datepipe: DatePipe = new DatePipe('en-US');
  addnotEdit: boolean = true;
  firstskiped = false;
  formerrors:any={
    duration:{valid:true,msg:'',oldvalue:''},
    start_time:{valid:true,msg:'',oldvalue:''}
  };
  form = {
    topic : '',
    agenda : '',
    start_time : '',
    duration : '',
    Wboard : '-1'
  }
  haszoomtoken: boolean = false;
  constructor(
    private events: EventsService,
    private teacherservice: TeacherService,
    private UserService: UserService,
    private storageService: StorageService,
  ) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.events.taskEvent.subscribe(state => {
      if (this.firstskiped) {
        if (state.task == this.events.TASKCHOOSECLASSES) {
          console.log("reciever class TASKCHOOSECLASSES 1", state.data.chosenClass);
          this.putClass(state.data.chosenClass);
        }
        if (state.task == this.events.TASKUPDATECLASSNOTIF) {
          if (state.data.tasktype == 4) {
            console.log(".tasktype==4 notif");
            this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
          }
        }
      } else this.firstskiped = true
    })
    this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
  }
  putClass(classe: any) {
    this.chosenClass = classe;
    if (classe) {
      console.log('chosenClass data', this.chosenClass.data);
      this.getWboardNames();
    }
    // if (classe) {
    //   this.showDD = Array(classe.data.notifications.length).fill(false);
    //   console.log("newNotifCount",this.chosenClass.newNotifCount);
    //   this.hightightnewNotif();
    // }
  }
  getWboardNames(){
    this.chosenClass.data.livestreams.forEach((stream:any) => {
      // console.log('stream',stream);
      if(stream.Wboard === undefined||stream.Wboard==-1){ stream.Wboard=-1; stream.WboardName = 'N/A'}
      else { 
        let found = this.chosenClass.data.whiteboards.find((Wb:any)=>(Wb.id==stream.Wboard))
        if(found) stream.WboardName = found.name;
        else {
          stream.WboardName = 'N/A';
          stream.Wboard=-1
        }
      }
    });
  }
  addStream() {
    this.peer = new Peer();
    this.form = {topic : '',agenda : '',start_time : '',duration : '60',Wboard : '-1'}
    // this.formInvalid = -1;
    // this.formInvalidmsg = '';
    if (this.haszoomtoken) {
      this.activeCard = 1;
      this.addnotEdit = true;
    } else {
      this.haszoomtoken = this.storageService.isLoggedIn() && (this.storageService.getUser().data.hasToken);
      console.log("this.haszoomtoken", this.haszoomtoken);
      if (this.haszoomtoken) {
        this.activeCard = 1;
        this.addnotEdit = true;
      } else {
        this.getToken()
      }
    }
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    // this.clean();
    this.activeCard = 0;
    console.log("backToList");
  }
  onSubmit() {
    if(!this.loading){
      this.loading=true;
      let valid =true;
      console.log("submit add");
      if(!this.form.agenda)this.form.agenda='new agenda';
      if(!this.form.topic)this.form.topic='new topic';
      if(!this.form.start_time){
        console.log("no time privided");
        valid=false;
      }else{
        console.log("temp 111 ");
        if(new Date().getTime()>new Date(this.form.start_time).getTime()){
          console.log("temp 222");
          this.formerrors.start_time={valid:false,msg:' time given already passed ',oldvalue:this.form.start_time};
        }
      }
      // if(+this.form.duration<10||+this.form.duration>180){
      //   console.log('ration must be between 5 min and 180 min not ',+this.form.duration);
      //   this.formerrors.duration = {valid:false,msg:' duration must be between 5 min and 180 min',oldvalue:this.form.duration};
      //   valid=false;
      // }
      if(valid && this.peer.id){
        console.log("CreateMeeting fired"); 
        this.CreateMeeting({...this.form,peer:this.peer.id});
      }else{
        this.loading=false;
      }
    }
     
  }
  clear(){
    this.formerrors={
      duration:{valid:true,msg:'',oldvalue:''},
      start_time:{valid:true,msg:'',oldvalue:''}
    };
  }
  getToken() {
    // window.location.href=
    const url = 'https://zoom.us/oauth/authorize?response_type=code&client_id=zWgF4lQeTQuXC5E4Mrd5A&redirect_uri=https://salhisite.web.app/reroute';
    window.open(url, "_blank");
  }
  CreateMeeting(data:any) {
    data.Wboard = +data.Wboard
    this.teacherservice.CreateMeeting(this.chosenClass.uuid,data).subscribe({
      next: data => {
        console.log("CreateMeeting data ", data);
        this.events.changeTaskState({task:this.events.TASKUPDATECLASSSTREAM,data:{tasktype:1,classid:this.chosenClass.uuid,liveStream:data.meeting}});
        this.getWboardNames();
        this.activeCard=0;
        this.clear();
        this.loading=false;
      },
      error: err => {
        console.log('error in CreateMeeting ', err)
      }
    })
  }
  openMeeting(meeting:any){
    this.chosenlivestream={...meeting};
    this.activeCard=2;
    console.log("open meeting",meeting);
    
  }


  startMeeting(mode:number){
    let url = window.location.origin+'/teacher/meeting?uuid='+this.chosenClass.uuid+'&indd='+this.chosenlivestream.indd+'&mode='+mode;
    if (mode==1) {
      url+="&Wboard="+this.chosenlivestream.Wboard;
    }
      window.open(url, "_blank");
  }

}
