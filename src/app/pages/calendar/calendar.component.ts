import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Calendar, CalendarOptions, DateSelectArg, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"

import { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @ViewChild(FullCalendarComponent) calendarElement!: FullCalendarComponent;
  events: EventSourceInput = [
    /*{ title: 'event 1', date: '2023-01-01', },
    { title: 'event 2', start: new Date() , end:'2023-01-30',color:'red'}*/
  ]
  calendarTitle = "";
  viewType: number = 0;
  datSelectionArg:DateSelectArg=null as any;
  calendarApi: Calendar = null as any;
  event: EventInput = {};
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick, // MUST ensure `this` context is maintained
    events: this.events,
    selectable: true,
    select:(arg)=>{
      this.datSelectionArg=arg;
      console.log("select");
    },
    unselect:()=>{
      setTimeout(() => {
        this.datSelectionArg=null as any;
        console.log("unselect");
      }, 200);      
    },
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    headerToolbar: false
    /*{
      start: 'title', // will normally be on the left. if RTL, will be on the right
      center: 'dayGridMonth timeGridWeek timeGridDay',
      end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    }*/
  };

  handleDateClick(args: DateClickArg) { 

  }
  constructor(private cdr: ChangeDetectorRef) { }
  test() {
    console.log(this.calendarApi.view.title);
  }
  ngOnInit(): void {

    //this.calendarApi=this.calendarComponent.getApi();
    //console.log(this.calendarApi.view);

  }
  ngAfterViewInit() {
    this.calendarApi = this.calendarElement.getApi();
    this.calendarTitle = this.calendarApi.view.title;
    this.cdr.detectChanges();
  }
  navigate(opt: number) {
    switch (opt) {
      case -1:
        this.calendarApi.today();
        break;

      case 1:
        this.calendarApi.prev();
        break;
      case 2:
        this.calendarApi.next();
        break;
    }
    this.calendarTitle = this.calendarApi.view.title;
  }
  nextView() {
    this.viewType = (this.viewType + 1) % 3
    switch (this.viewType) {
      case 0:
        this.calendarApi.changeView("dayGridMonth" )
        break;

      case 1:
        this.calendarApi.changeView("timeGridWeek")
        break;
      case 2:
        this.calendarApi.changeView("timeGridDay")
        break;
    }
    this.calendarTitle = this.calendarApi.view.title;
  }
  addevent(){
    console.log(this.datSelectionArg);
    
  }
}
