import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsesubject, parsesubjectIcon, parsegrade } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-teacher-classes',
  templateUrl: './teacher-classes.component.html',
  styleUrls: ['./teacher-classes.component.scss']
})
export class TeacherClassesComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  subscription3: Subscription = new Subscription();
  selectedUser: any = null;
  editing: boolean = false;
  chosenClass: any = null;
  connectedCount: number = -1;
  loading: boolean = false;
  changeRoleResult = -1;
  datepipe: DatePipe = new DatePipe('en-US');
  constructor(private events: EventsService, private teacherservice: TeacherService, private authService: AuthService,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription3 = this.events.taskEvent.subscribe(state => {
      if (state.task == this.events.TASKCHOOSECLASSES) {
        this.chosenClass = state.data.chosenClass;
        if (this.selectedUser) this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.email == this.selectedUser.email);
      }
      if (state.task == this.events.TASKCONNECTEDRECIEVED) {
        if(this.chosenClass&&this.chosenClass.uuid===state.data.connectedfor) this.chosenClass = state.data.chosenClass;
      }
    })
    this.events.changeTaskState({task:this.events.TASKGETCHOSENCLASS,data:null});
  }
  refreshconnected() {
    this.events.changeTaskState({ task: this.events.TASKREFRESHCONNECTED, data: { uuid: this.chosenClass.uuid, } })
  }
  edit(user: string) {
    console.log(user);
    this.editing = true;
    this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.username == user);
  }
  changeStatus() {
    console.log("changeStatus");
    if (!this.loading) {
      this.loading = true;
      this.teacherservice.editacceptedstudent(this.chosenClass.id, this.selectedUser.email, !this.selectedUser.accepted).subscribe({
        next: (data: any) => {
          if (data) {
            console.log("editacceptedstudent data ", data);
            // this.changeRoleResult=1;
            this.loading = false;
            this.selectedUser.accepted = !this.selectedUser.accepted;
            this.events.changeTaskState({ task: this.events.TASKGETCLASSES, data: {} as any });
          }
        },
        error: (err) => {
          console.log("editacceptedstudent err ", err);
          this.changeRoleResult = 2;
          this.loading = false;
        }
      })
    } else {
      console.log("wait");

    }

  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.editing = false;
    this.selectedUser = null;
    console.log("backToList");
  }
  parsegrade(grade: number): string {
    return parsegrade(grade);
  }
  parsesubject(subject: number): string {
    return parsesubject(subject);
  }
  parsesubjectIcon(subject: number): string {
    return parsesubjectIcon(subject);
  }

}
