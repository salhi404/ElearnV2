import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import {  Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsenotifstatus } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-teacher-notifications',
  templateUrl: './teacher-notifications.component.html',
  styleUrls: ['./teacher-notifications.component.scss']
})
export class TeacherNotificationsComponent implements OnInit, OnDestroy {
  @ViewChild("moreDD") moreDD!: ElementRef;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  chosenClass: any = null;
  editing: boolean = false;
  loading: boolean = false;
  datepipe: DatePipe = new DatePipe('en-US');
  selectedNotif:any=null;
  addnotEdit:boolean=true;
  formInvalid:number=-1;
  formInvalidmsg:string='';
  notifIdToedit=-1;
  showDD: boolean[] = [];
  blockcloseDD: boolean = false;
  openedDD:number=-1;
  form={
    type:'',
    send:'',
    time:'',
    notification:'',
    status:'',
  }
  constructor(private events: EventsService, private teacherservice: TeacherService, private authService: AuthService,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription = this.events.taskEvent.subscribe(state => {
      if (state.task == this.events.TASKCHOOSECLASSES) {
        console.log("reciever class TASKCHOOSECLASSES 1",state.data.chosenClass);
        
        this.putClass(state.data.chosenClass)
        // if (this.selectedUser) this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.email == this.selectedUser.email);
      }
      if (state.task == this.events.TASKCONNECTEDRECIEVED) {
        console.log("reciever class TASKCONNECTEDRECIEVED 2",state.data.chosenClass);
        if(this.chosenClass&&this.chosenClass.uuid===state.data.connectedfor){
          this.putClass(state.data.chosenClass)
        } 
      }
    })
    this.events.changeTaskState({task:this.events.TASKGETCHOSENCLASS,data:null});
  }
  putClass(classe:any){
    this.chosenClass =classe;
    if(classe){
      this.showDD= Array(classe.data.notifications.length).fill(false);
      console.log("this.showDD = ",this.showDD);
    }

    
  }
  addNotif(){
    this.form={type:'3',send:'1',time:'',notification:'',status:''}
    this.formInvalid=-1;
    this.formInvalidmsg='';
    this.editing = true;
    this.addnotEdit=true;
  }
  editNotif(ind:number){
    this.form={
      type:this.chosenClass.data.notifications[ind].type+'',
      send:this.chosenClass.data.notifications[ind].send+'',//2023-03-22T00:31
      time:this.datepipe.transform(this.chosenClass.data.notifications[ind].time,'yyyy-MM-ddThh:mm')||'',
      notification:this.chosenClass.data.notifications[ind].notification,
      status:this.chosenClass.data.notifications[ind].status+''
    }
    console.log("this.chosenClass.data.notifications[ind]",this.chosenClass.data.notifications[ind]);
    this.notifIdToedit=this.chosenClass.data.notifications[ind].id;
    this.formInvalid=-1;
    this.formInvalidmsg='';
    this.editing = true;
    this.addnotEdit=false;
    this.toggleDD(this.openedDD);
  }
  deleteNotif(ind:number){
    const notifToDelete=this.chosenClass.data.notifications[ind].id;
    
  }
  removeNotif(ind:number){
    const notifToDelete=this.chosenClass.data.notifications[ind].id;
    
  }
  testt(){
  }
  edit(user: string) {
    console.log(user);
    this.editing = true;
    // this.selectedNotif =
  }
  onSubmit():number{
    console.log("Submit");
    if(this.form.send==='2'){
      const nowtemp=new Date();
      const formTime=new Date(this.form.time);
      if(formTime.getTime()<nowtemp.getTime()){
        this.formInvalid=1;
        this.formInvalidmsg='you need to set time in the future';
        return 1
      }else{
        this.formInvalid=-1;
        this.formInvalidmsg='';
      }
    }
    if(this.form.notification==='')this.form.notification="new Notification";
    let notifTosend:any={type:+this.form.type,send:+this.form.send,time:new Date(this.form.time),notification:this.form.notification,status:+this.form.status};
    console.log("notifTosend = ",notifTosend);
    if(notifTosend.send==1)notifTosend.time=new Date();
    if(this.addnotEdit){
      notifTosend.status='1';
       this.teacherservice.addclassnotif(this.chosenClass.uuid,notifTosend).subscribe({
        next:data=>{
          console.log("addclassnotif : ",data);
          this.backToList();
        },
        error:err=>{
          console.log('err');
          console.log(err);
        }
      });
    }else{
      notifTosend.id=this.notifIdToedit;
      console.log("this.notifIdToedit",this.notifIdToedit);
      
      this.teacherservice.editclassnotif(this.chosenClass.uuid,notifTosend).subscribe({
        next:data=>{
          console.log("editclassnotif : ",data);
          this.backToList();
        },
        error:err=>{
          console.log('err');
          console.log(err);
        }
      });
    }
    return 0
  }
  clean(){
    this.form={type:'',send:'',time:'',notification:'',status:'',};
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.clean();
    this.editing = false;
    console.log("backToList");
  }
  parsenotifstatus(status:number):string{
    return parsenotifstatus(status)
  }
  toggleDD(ind:number) {
    if (this.openedDD!=-1&&this.openedDD!=ind) {
      this.showDD[this.openedDD] = false;
    }
    this.showDD[ind] = !this.showDD[ind];
    this.openedDD=ind;
    this.blockcloseDD = true;
    setTimeout(() => {
      this.blockcloseDD = false;
    }, 300);
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.chosenClass&&this.showDD.length>0) {
      if (!this.moreDD?.nativeElement.contains(event.target) && !this.blockcloseDD && this.openedDD>-1) {
        this.showDD[this.openedDD] = false;
        this.openedDD=-1;
    }
    }

}
}
