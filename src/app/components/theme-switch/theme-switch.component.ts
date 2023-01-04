import { Component, OnInit ,Input } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
@Component({
  selector: 'app-theme-switch',
  templateUrl: './theme-switch.component.html',
  styleUrls: ['./theme-switch.component.scss']
})
export class ThemeSwitchComponent implements OnInit {
  @Input() isChecked : boolean=true;
  constructor(private events:EventsService,) { }
  checkCheckBoxvalue(event:any){
    if(event)this.events.chngLayoutEvent(this.events.DARKTHEMELIGHT);
    else this.events.chngLayoutEvent(this.events.DARKTHEMEDARK);
 }
  ngOnInit(): void {
  }

}
