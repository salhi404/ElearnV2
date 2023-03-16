import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModService } from 'app/_services/mod.service';
@Component({
  selector: 'app-settings-mod',
  templateUrl: './settings-mod.component.html',
  styleUrls: ['./settings-mod.component.scss']
})
export class SettingsModComponent {
  constructor(private modservice: ModService) { }
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    // this.subscription1.unsubscribe();
  }
  ngOnInit(): void {

  }
  initialise(ind:number){
    this.modservice.initiate(ind).subscribe({
      next:data=>{
        console.log("initialise data ",data);
        
      },
      error:err=>{
        console.log("initialise error ",err);
      }
    })
  }
}
