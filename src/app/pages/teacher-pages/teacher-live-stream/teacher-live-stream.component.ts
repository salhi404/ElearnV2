import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/_services/user.service';
import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { TeacherService } from 'app/_services/teacher.service';
import { StorageService } from 'app/_services/storage.service';
import { DatePipe } from '@angular/common';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
// import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-teacher-live-stream',
  templateUrl: './teacher-live-stream.component.html',
  styleUrls: ['./teacher-live-stream.component.scss']
})
export class TeacherLiveStreamComponent implements OnInit {
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  editing: boolean = false;
  loading: boolean = false;
  chosenClass: any = null;
  datepipe: DatePipe = new DatePipe('en-US');
  addnotEdit: boolean = true;
  firstskiped = false;
  form = {
    type: '',
    send: '',
    time: '',
    notification: '',
    status: '',
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
    }
    // if (classe) {
    //   this.showDD = Array(classe.data.notifications.length).fill(false);
    //   console.log("newNotifCount",this.chosenClass.newNotifCount);
    //   this.hightightnewNotif();
    // }
  }
  addStream() {
    this.form = { type: '3', send: '1', time: '', notification: '', status: '' }
    // this.formInvalid = -1;
    // this.formInvalidmsg = '';
    if (this.haszoomtoken) {
      this.editing = true;
      this.addnotEdit = true;
    } else {
      this.haszoomtoken = this.storageService.isLoggedIn() && (this.storageService.getUser().data.hasToken);
      console.log("this.haszoomtoken", this.haszoomtoken);
      if (this.haszoomtoken) {
        this.editing = true;
        this.addnotEdit = true;
      } else {
        this.getToken()
      }
    }
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    // this.clean();
    this.editing = false;
    console.log("backToList");
  }
  onSubmit() {
    console.log("submit add");
    this.CreateMeeting()

  }
  getToken() {
    // window.location.href=
    const url = 'https://zoom.us/oauth/authorize?response_type=code&client_id=zWgF4lQeTQuXC5E4Mrd5A&redirect_uri=https://salhisite.web.app/reroute';
    window.open(url, "_blank");
  }
  CreateMeeting() {
    this.UserService.CreateMeeting().subscribe({
      next: data => {
        console.log("CreateMeeting data ", data);
      },
      error: err => {
        console.log('error in CreateMeeting ', err)
      }
    })
  }
}
