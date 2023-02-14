import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { ModService } from 'app/_services/mod.service';
import { parsegrade, parserole, getmainrole } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-users-mod',
  templateUrl: './users-mod.component.html',
  styleUrls: ['./users-mod.component.scss']
})
export class UsersModComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  user: User = null as any;
  usersList: any[] = [];
  selectedUser:any=null;
  editing:boolean=false;
  datepipe: DatePipe = new DatePipe('en-US');
  loading:boolean=false;
  changeRoleResult=-1;
  timeout1: any;
  connectedCount:number=-1;
  form:any={
    user:false,
    teacher:false,
    moderator:false,
    admin:false,
  }
  constructor(private events: EventsService, private modservice: ModService,private authService: AuthService,) { }
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
    this.subscription1 = this.modservice.getUsers().subscribe({
      next: data => {
        console.log("data");
        console.log(data);
        if (data.users) {
          this.usersList = data.users;
          this.getconnectedchaters()
        }

      },
      error: err => {
        console.log(err);

      }
    })

  }
  getconnectedchaters() {
    this.authService.getconnectedchatters(this.usersList.map(e => e.email)).subscribe({
      next: (data: any) => {
        /* console.log("connected chaters data recieved ");
         console.log(data);*/
         if(data){
          this.connectedCount=0;
          data.forEach((elem:any) => {
             const userr = this.usersList.find((user: any) => elem.user == user.email);
             if(elem.date==-1)this.connectedCount++;
             if(userr) userr.OnlineStat=elem.date;
          })
          console.log("this.connectedCount",this.connectedCount);
          
          var info=this.events.modinfoEvent.getValue();
          info.connectedCount=this.connectedCount;
          info.usersCount=data.length;
          this.events.changemodInfoState(info);
         }
      },
      error: (err) => {
        console.log("err");
        console.log(err);
      }
    })
  }
  parserole(role: string): string {
    return parserole(role);
  }
  parsegrade(grade: number): string {
    return parsegrade(grade);
  }
  edit(user:string){
    console.log(user);
    this.editing=true;
    this.selectedUser=this.usersList.find(userr=>userr.username==user);
    this.populateForm(this.selectedUser.roles);
  }
  populateForm(roles:string[]){
    this.form={user:false,teacher:false,moderator:false,admin:false}
    if(roles.includes('user'))this.form.user=true;
    if(roles.includes('teacher'))this.form.teacher=true;
    if(roles.includes('moderator'))this.form.moderator=true;
    if(roles.includes('admin'))this.form.admin=true;
  }
  backToList(){
    this.form={user:false,teacher:false,moderator:false,admin:false}
    this.editing=false;
    this.selectedUser=null;
    console.log("backToList");
  }
  submitRoles(){
    if(this.changeRoleResult==-1){
    this.loading=true;
    console.log('submitRoles');
    let temproles=[];
    if(this.form.user)temproles.push('user');
    if(this.form.teacher)temproles.push('teacher');
    if(this.form.moderator)temproles.push('moderator');
    if(this.form.admin)temproles.push('admin');
    console.log(temproles);
    this.modservice.changeRoles(this.selectedUser.username,temproles).subscribe({
      next: data => {
        console.log("data");
        console.log(data);
        if(data.user){
          let found= this.usersList.find(user=>user.username==data.user);
          if(found) found.roles=data.roles;
          if (this.editing) {
            this.populateForm(data.roles);
          } 
        }
        this.loading=false;
        this.changeRoleResult=1;
        setTimeout(() => {
          this.changeRoleResult=-1;
        }, 2500);
      },
      error: err => {
        console.log(err);
        this.loading=false;
        this.changeRoleResult=2;
        setTimeout(() => {
          this.changeRoleResult=-1;
        }, 2500);
      }
    })
  }}
}
