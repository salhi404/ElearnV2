import { Component, OnInit,OnDestroy } from '@angular/core';
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
  user: User = null as any;
  form:any={
    user:false,
    teacher:false,
    moderator:false,
    admin:false,
  }
  constructor(private events: EventsService, private teacherservice: TeacherService,/*private authService: AuthService,*/) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
     this.subscription1.unsubscribe();
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
    // this.subscription1 = this.teacherservice.getUsers().subscribe({
    //   next: data => {
    //     console.log("data");
    //     console.log(data);

    //   },
    //   error: err => {
    //     console.log(err);

    //   }
    // })

  }
}
