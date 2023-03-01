import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsesubject, parsesubjectIcon, parsegrade } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-teacher-notifications',
  templateUrl: './teacher-notifications.component.html',
  styleUrls: ['./teacher-notifications.component.scss']
})
export class TeacherNotificationsComponent implements OnInit, OnDestroy {
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
        this.chosenClass = state.data.chosenClass;
        // if (this.selectedUser) this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.email == this.selectedUser.email);
      }
      if (state.task == this.events.TASKCONNECTEDRECIEVED) {
        if(this.chosenClass&&this.chosenClass.uuid===state.data.connectedfor) this.chosenClass = state.data.chosenClass;
      }
    })
    this.events.changeTaskState({task:this.events.TASKGETCHOSENCLASS,data:null});
  }
  addNotif(){
    this.form={type:'3',send:'1',time:'',notification:'',status:''}
    this.formInvalid=-1;
    this.formInvalidmsg='';
    this.editing = true;
    this.addnotEdit=true;
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
    if(this.addnotEdit){
      
    }
    return 0
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.editing = false;
    console.log("backToList");
  }
}
