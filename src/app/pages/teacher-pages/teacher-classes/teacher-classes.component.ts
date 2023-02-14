import { Component, OnInit,OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
// import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsegrade, parserole, getmainrole } from 'app/functions/parsers';
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
  user: User = null as any;
  classes:any[]=[];
  blockHostListener=false;
  modelShowen:boolean=false;
  addnotEdit=true;
  fadeModel:boolean=false;
  form:any={
    class:'',
    subject:1,
  }
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  constructor(private events: EventsService, private teacherservice: TeacherService,/*private authService: AuthService,*/) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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
    this.subscription1 = this.teacherservice.getClasses().subscribe({
      next: data => {
        console.log("getClasses");
        console.log(data);
        if(data.classes){
          this.classes=data.classes;
        }

      },
      error: err => {
        console.log(err);

      }
    })
  }

  openModel(issAdd:boolean){
    this.addnotEdit=issAdd;
    if(issAdd){
      this.form={ class:'', subject:'1', }
    }
    this.blockHostListener=true;
    setTimeout(() => {
      this.blockHostListener=false;
    }, 300);
    this.modelShowen=true;
    setTimeout(() => {
    this.fadeModel=true;
    }, 10);
  }
  closeModel(){
    this.fadeModel=false;
    setTimeout(() => {
      this.modelShowen=false;
    }, 150);
  }
  submitModal(){
    
    if(this.form.class==='')this.form.class="My Class";
    this.subscription2=this.teacherservice.addclass(this.form.class,+this.form.subject).subscribe({
      next: data => {
        console.log("getClasses");
        console.log(data);
        if(data.classes){
          this.classes=data.classes;
        }
      },
      error: err => {
        console.log(err);

      }
    })
    console.log("submit",this.form);
    this.closeModel();
  }
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(!this.modalDialog.nativeElement.contains(event.target)&&!this.blockHostListener){
      console.log('close');
      this.closeModel();    
    }
  }
}
