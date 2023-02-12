import { Component , OnInit} from '@angular/core';

@Component({
  selector: 'app-users-mod',
  templateUrl: './users-mod.component.html',
  styleUrls: ['./users-mod.component.scss']
})
export class UsersModComponent implements  OnInit {
  dtOptions: DataTables.Settings = {};
  ngOnInit(): void {
  this.dtOptions = {
    pagingType: 'full_numbers',
    //ajax: 'data/data.json',
    columns: [{
      title: 'Pic',
      data: 'pic'
    },{
      title: 'Username',
      data: 'username'
    }, {
      title: 'Roles',
      data: 'roles'
    }, {
      title: 'Status',
      data: 'status'
    },{
      title: 'First name',
      data: 'firstName'
    }, {
      title: 'Last name',
      data: 'lastName'
    }, {
      title: 'Edit',
      data:'id',
      render: function (data: any, type: any, full: any) {
        return '<div user-id="'+full.username+'"  class="btn btn-info pointer">edit</div>';
      }
    }]
  };
}
}
