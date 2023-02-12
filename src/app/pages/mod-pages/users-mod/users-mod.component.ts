import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { ModService } from 'app/_services/mod.service';
import { parsegrade, parserole, getmainrole } from 'app/functions/parsers';
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
  constructor(private events: EventsService, private modervice: ModService,) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription = this.events.userdataEvent.subscribe(
      state => {
        console.log("userdataEvent 11");
        if (state.state == 1) this.user = state.userdata;
      }
    )
    this.subscription1 = this.modervice.getUsers().subscribe({
      next: data => {
        console.log("data");
        console.log(data);
        if (data.users) {
          this.usersList = data.users;
        }

      },
      error: err => {
        console.log(err);

      }
    })
    this.dtOptions = {
      pagingType: 'full_numbers',
      //ajax: 'data/data.json',
      columns: [{
        title: 'Pic',
        data: 'pic'
      }, {
        title: 'Username',
        data: 'username'
      }, {
        title: 'Roles',
        data: 'roles'
      }, {
        title: 'Status',
        data: 'status'
      }, {
        title: 'First name',
        data: 'firstName'
      }, {
        title: 'Last name',
        data: 'lastName'
      }, {
        title: 'Edit',
        
        render: function (data: any, type: any, full: any) {
          return '<div user-id="' + full.username + '"  class="btn btn-info pointer">edit</div>';
        }
      }]
    };
  }
  parserole(role: string): string {
    return parserole(role);
  }
  edit(user:string){
    console.log(user);
    
  }
}
