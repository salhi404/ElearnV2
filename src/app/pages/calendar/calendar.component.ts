import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"

import { DateClickArg } from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  events:EventSourceInput=[
    { title: 'event 1', date: '2023-01-01', },
    { title: 'event 2', date: new Date() ,slotDuration: '02:00'}
  ]
  event:EventInput={};
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: (args:DateClickArg)=>{
      console.log("click date");
      
      console.log(args);
      
    }, // MUST ensure `this` context is maintained
    events: this.events,
    plugins: [dayGridPlugin,interactionPlugin,timeGridPlugin],
    headerToolbar:  {
      start: 'title', // will normally be on the left. if RTL, will be on the right
      center: 'dayGridMonth timeGridWeek',
      end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    }
  };

  handleDateClick(arg:DateClickArg) {
    console.log('date click! ' + arg.dateStr);
  }
  constructor() { }

  ngOnInit(): void {
  }

}
