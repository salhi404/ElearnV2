import { Component, OnInit,OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsesubject ,parsesubjectIcon,parsegrade } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-teacher-classes',
  templateUrl: './teacher-classes.component.html',
  styleUrls: ['./teacher-classes.component.scss']
})
export class TeacherClassesComponent implements OnInit,OnDestroy {
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  subscription3: Subscription = new Subscription();
  selectedUser:any=null;
  editing:boolean=false;
  user: User = null as any;
  classes:any[]=[];
  chosenClass:any=null;
  chosenIndex:number=-1;
  connectedCount:number=-1;
  loading:boolean=false;
  changeRoleResult=-1;
  datepipe: DatePipe = new DatePipe('en-US');

  constructor(private events: EventsService, private teacherservice: TeacherService,private authService: AuthService,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription = this.events.userdataEvent.subscribe(
      state => {
        console.log("userdataEvent 11");
        if(state.state==1){
          this.user=state.userdata;
        }
        if(state.state==2){
          this.user=null as any;
        }
      }
    )
    this.subscription1 = this.events.classinfostatusEvent.subscribe(
      state => {
        console.log("Classes retreived");
        if(state.state==1&&state.classes){
          this.classes=state.classes;
          console.log("state.state==",state.state);
          
        }
        if(state.state==2&&state.classes){
          console.log("state.state==",state.state);
          if(this.chosenClass&&this.selectedUser){
            this.classes=state.classes;
            this.events.changeTaskState({task:10,data:{chosenIndex:this.chosenIndex ,chosenClass:this.classes[this.chosenIndex]}})
            console.log("selectedUser before",this.selectedUser);
            this.selectedUser=this.chosenClass.enrollers.find((userr:any)=>userr.email==this.selectedUser.email);
            console.log("selectedUser after",this.selectedUser);
          }

          
        }
      }
    )
    this.subscription3=this.events.taskEvent.subscribe(state=>{
      if(state.task==10){
        this.chosenIndex=state.data.chosenIndex;
        this.chosenClass=state.data.chosenClass;
      }
      if(state.task==16){
        if(this.selectedUser&&this.chosenClass){
          console.log("161616161");
          
          console.log(this.selectedUser);
          
        }
      }
    })
  }
getconnectedchaters() {
  this.authService.getconnectedchatters(this.chosenClass.enrollers.map((e:any) => e.email)).subscribe({
    next: (data: any) => {
      /* console.log("connected chaters data recieved ");
       console.log(data);*/
       if(data){
        this.connectedCount=0;
        data.forEach((elem:any) => {
           const userr = this.chosenClass.enrollers.find((user: any) => elem.user == user.email);
           if(elem.date==-1)this.connectedCount++;
           if(userr) userr.OnlineStat=elem.date;
        })
        console.log("this.connectedCount",this.connectedCount);
       }
    },
    error: (err) => {
      console.log("err");
      console.log(err);
    }
  })
}
edit(user:string){
  console.log(user);
  this.editing=true;
  this.selectedUser=this.chosenClass.enrollers.find((userr:any)=>userr.username==user);
}
changeStatus(){
  console.log("changeStatus");
  if(!this.loading){
    this.loading=true;
    this.teacherservice.editacceptedstudent(this.chosenClass.id,this.selectedUser.email,!this.selectedUser.accepted).subscribe({
      next: (data: any) => {
         if(data){
          console.log("editacceptedstudent data ",data);
          // this.changeRoleResult=1;
          this.loading=false;
          this.selectedUser.accepted=!this.selectedUser.accepted;
          this.events.changeTaskState({task:15,data:{}as any});   
         }
      },
      error: (err) => {
        console.log("editacceptedstudent err ",err);
        this.changeRoleResult=2;
        this.loading=false;
      }
    })
    // setTimeout(() => {
    //   this.changeRoleResult=-1;
    // }, 2500);
  }else{
    console.log("wait");
    
  }

}
backToList(){
  //this.form={user:false,teacher:false,moderator:false,admin:false}
  this.editing=false;
  this.selectedUser=null;
  console.log("backToList");
}
parsegrade(grade: number): string {
  return parsegrade(grade);
}
  parsesubject(subject:number):string{
    return parsesubject(subject);
  }
  parsesubjectIcon(subject:number):string{
    return parsesubjectIcon(subject);
  }

}
