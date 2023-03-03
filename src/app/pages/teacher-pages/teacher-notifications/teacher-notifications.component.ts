import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
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
  selectedNotif: any = null;
  addnotEdit: boolean = true;
  formInvalid: number = -1;
  formInvalidmsg: string = '';
  notifIdToedit = -1;
  showDD: boolean[] = [];
  blockcloseDD: boolean = false;
  openedDD: number = -1;
  form = {
    type: '',
    send: '',
    time: '',
    notification: '',
    status: '',
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
        console.log("reciever class TASKCHOOSECLASSES 1", state.data.chosenClass);

        this.putClass(state.data.chosenClass)
        // if (this.selectedUser) this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.email == this.selectedUser.email);
      }
      if (state.task == this.events.TASKCONNECTEDRECIEVED) {
        console.log("reciever class TASKCONNECTEDRECIEVED 2", state.data.chosenClass);
        if (this.chosenClass && this.chosenClass.uuid === state.data.connectedfor) {
          this.putClass(state.data.chosenClass)
        }
      }
      // if (state.task == this.events.TASKDELETECLASSNOTIFSCHEDULE) {
      //   if(this.chosenClass&&this.chosenClass.uuid===state.data.classuuid){
      //     this.chosenClass.data.notifschedule=this.chosenClass.data.notifschedule.filter((ntf:any)=>ntf!=state.data.id);
      //   }
      // }
    })
    this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
  }
  putClass(classe: any) {
    this.chosenClass = classe;
    if (classe) {
      this.showDD = Array(classe.data.notifications.length).fill(false);
      console.log("this.showDD = ", this.showDD);
    }


  }
  addNotif() {
    this.form = { type: '3', send: '1', time: '', notification: '', status: '' }
    this.formInvalid = -1;
    this.formInvalidmsg = '';
    this.editing = true;
    this.addnotEdit = true;
  }
  editNotif(ind: number) {
    this.form = {
      type: this.chosenClass.data.notifications[ind].type + '',
      send: this.chosenClass.data.notifications[ind].send + '',//2023-03-22T00:31
      time: this.datepipe.transform(this.chosenClass.data.notifications[ind].time, 'yyyy-MM-ddThh:mm') || '',
      notification: this.chosenClass.data.notifications[ind].notification,
      status: this.chosenClass.data.notifications[ind].status + ''
    }
    console.log("this.chosenClass.data.notifications[ind]", this.chosenClass.data.notifications[ind]);
    this.notifIdToedit = this.chosenClass.data.notifications[ind].id;
    this.formInvalid = -1;
    this.formInvalidmsg = '';
    this.editing = true;
    this.addnotEdit = false;
    this.toggleDD(this.openedDD);
  }
  deleteNotif(ind: number) {
    const notifToDelete = this.chosenClass.data.notifications[ind].id;

  }
  removeNotif(ind: number) {
    const notifToDelete = this.chosenClass.data.notifications[ind].id;
    this.teacherservice.removeclassnotif(this.chosenClass.uuid, notifToDelete).subscribe({
      next: data => {
        console.log("removeclassnotif : ", data);
        this.events.changeTaskState({ task: this.events.TASKUPDATECLASSNOTIF, data: { tasktype: 3, classid: this.chosenClass.uuid, notifId: notifToDelete } });
        this.toggleDD(this.openedDD);
        this.chosenClass.data.notifications = this.chosenClass.data.notifications.filter((ntf: any) => ntf.id != notifToDelete);
      },
      error: err => {
        console.log('err');
        console.log(err);
      }
    });
  }
  actionFunc(type: number, ind: number) {
    let notifToEdit = { ...this.chosenClass.data.notifications[ind] };
    if (type == 1) {
      if (notifToEdit.send == 1) {
        notifToEdit.time = new Date();
        notifToEdit.status = 3;
      } else {
        if (notifToEdit.send == 2) {
          const nowtemp = new Date();
          const formTime = new Date(notifToEdit.time);
          if (formTime.getTime() < nowtemp.getTime()) {
            notifToEdit.status = 3;
          } else {
            notifToEdit.status = 2; //TODO scheduele notifications
          }
        }
      }
      this.editNotifSubmit(notifToEdit,0);
    }
    if (type == 2 || type == 3) {
      notifToEdit.status = 1;
      this.editNotifSubmit(notifToEdit,0);
    }
  }
  checkschedule(){
    this.chosenClass.data.notifschedule.forEach((element:any,ind:number) => {
      this.checkqueTime(element.status,ind);
    });
  }
  checkqueTime(type:number, ind: number) {
    let notifToEdit = { ...this.chosenClass.data.notifications[ind] };
    const nowtemp = new Date();
    const formTime = new Date(notifToEdit.time);
    if (formTime.getTime() < nowtemp.getTime()) {
      if(type==1){
        notifToEdit.send = 1;
      }else{
        if(type==2){
          notifToEdit.status = 3;
        }
      }
      this.editNotifSubmit(notifToEdit,1);
    }
  }
  testt() {
  }
  edit(user: string) {
    console.log(user);
    this.editing = true;
    // this.selectedNotif =
  }
  onSubmit(): number {
    console.log("Submit");
    if (this.form.send === '2') {
      const nowtemp = new Date();
      const formTime = new Date(this.form.time);
      if (formTime.getTime() < nowtemp.getTime()) {
        this.formInvalid = 1;
        this.formInvalidmsg = 'you need to set time in the future';
        return 1
      } else {
        this.formInvalid = -1;
        this.formInvalidmsg = '';
      }
    }
    if (this.form.notification === '') this.form.notification = "new Notification";
    let notifTosend: any = { type: +this.form.type, send: +this.form.send, time: new Date(this.form.time), notification: this.form.notification, status: +this.form.status };
    if (notifTosend.send == 1) {
      notifTosend.time = new Date();
    }
    if (this.addnotEdit) {
      notifTosend.status = '1';
      this.teacherservice.addclassnotif(this.chosenClass.uuid, notifTosend).subscribe({
        next: data => {
          console.log("addclassnotif : ", data);
          this.events.changeTaskState({ task: this.events.TASKUPDATECLASSNOTIF, data: { tasktype: 1, classid: this.chosenClass.uuid, notif: data.notif } });
          // this.chosenClass.data.notifications.push(data.notif);
          this.backToList();
        },
        error: err => {
          console.log('err');
          console.log(err);
        }
      });
    } else {
      notifTosend.id = this.notifIdToedit;
      this.editNotifSubmit(notifTosend,0);
    }
    return 0
  }
  editNotifSubmit(notifTosend: any,task:number) {
    console.log("this.notifIdToedit", this.notifIdToedit);
    this.teacherservice.editclassnotif(this.chosenClass.uuid, notifTosend,task).subscribe({
      next: data => {
        console.log("editclassnotif : ", data);
        // const index = this.chosenClass.data.notifications.findIndex((notiff:any)=>notiff.id==data.notif.id);
        //   if(index){
        //     this.chosenClass.data.notifications[index] = data.notif
        //   }
        this.events.changeTaskState({ task: this.events.TASKUPDATECLASSNOTIF, data: { tasktype: 2, classid: this.chosenClass.uuid, notif: data.notif } });
        // if(data.notif.status==3)this.events.changeTaskState({ task: this.events.TASKDELETECLASSNOTIFSCHEDULE, data: { classuuid:this.chosenClass.uuid, id:data.notif.id} })
        this.backToList();
      },
      error: err => {
        console.log('err');
        console.log(err);
      }
    });
  }
  clean() {
    this.form = { type: '', send: '', time: '', notification: '', status: '', };
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.clean();
    this.editing = false;
    console.log("backToList");
  }
  parsenotifstatus(status: number): string {
    return parsenotifstatus(status)
  }
  toggleDD(ind: number) {
    if (this.openedDD != -1 && this.openedDD != ind) {
      this.showDD[this.openedDD] = false;
    }
    this.showDD[ind] = !this.showDD[ind];
    this.openedDD = ind;
    this.blockcloseDD = true;
    setTimeout(() => {
      this.blockcloseDD = false;
    }, 300);
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.chosenClass && this.showDD.length > 0) {
      if (!this.moreDD?.nativeElement.contains(event.target) && !this.blockcloseDD && this.openedDD > -1) {
        this.showDD[this.openedDD] = false;
        this.openedDD = -1;
      }
    }

  }
}
