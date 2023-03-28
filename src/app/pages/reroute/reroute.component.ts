import { Component, OnInit} from '@angular/core';
import { StorageService } from 'app/_services/storage.service';
import { UserService } from '../../_services/user.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-reroute',
  templateUrl: './reroute.component.html',
  styleUrls: ['./reroute.component.scss']
})
export class RerouteComponent implements OnInit {
  constructor(
    private UserService:UserService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    ) {
  }
  ngOnInit() {
    this.route.queryParams
    .subscribe((params:any) => {
      console.log(params); // { code: "price" }
      const code = params.code||'';
      if(code){
        this.UserService.getaccestoken(code).subscribe({
          next: data => {
            this.storageService.setzoomtoken("zoomtoken",{ zoom_refresh_token:data.data.refresh_token , zoomtoken:data.data.access_token,zoomtoken_expire:(new Date().getTime() + (data.data.expires_in-5)*1000)})
            console.log("getaccestoken data ",data);
          },
          error: err => {
            console.log('error in getaccestoken ',err)
          }
        })
      }
    }
  );
  }
}
