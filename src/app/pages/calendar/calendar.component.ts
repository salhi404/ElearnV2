import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Calendar, CalendarOptions, DateSelectArg, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"
import { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../_services/auth.service';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @ViewChild(FullCalendarComponent) calendarElement!: FullCalendarComponent;
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  blockHostListener:boolean=false;
  events: EventSourceInput = [
    /*{ title: 'event 1', date: '2023-01-01', },
    { title: 'event 2', start: new Date() , end:'2023-01-30',color:'red'}*/
  ]
  form={
    event:'',
    startDate:'',
    startTime:'',
    endDate:'',
    endTime:'',
  }
  datepipe: DatePipe = new DatePipe('en-US');
  modelShowen:boolean=false;
  calendarTitle = "";
  dateselected:boolean=false;
  dateselectedhelper:boolean=false;
  fadeModel=false;
  viewType: number = 0;
  datSelectionArg:DateSelectArg=null as any;
  calendarApi: Calendar = null as any;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick, // MUST ensure `this` context is maintained
    events: this.events,
    locale: 'en-GB',
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    selectable: true,
    select:(arg)=>{
      setTimeout(() => {
        this.dateselected=true;
        this.dateselectedhelper=true;
        this.datSelectionArg=arg;
        console.log("select");
      }, 200);
    }
    ,
    unselect:(arg)=>{
      setTimeout(() => {
        this.dateselected= this.dateselectedhelper;
      }, 300);
      setTimeout(() => {
        this.datSelectionArg=null as any;
        this.dateselectedhelper=false;
        console.log("unselect");
        console.log(arg);
      }, 100);      
    },
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    headerToolbar: false,
    /*{
      start: 'title', // will normally be on the left. if RTL, will be on the right
      center: 'dayGridMonth timeGridWeek timeGridDay',
      end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    }*/
  };

  handleDateClick(args: DateClickArg) { 

  }
  constructor(private cdr: ChangeDetectorRef,private authService: AuthService) { }
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
    this.authService.getEvents().subscribe({
      next:data=>{
        console.log('data');
        console.log(data.data);
        data.data.forEach((element:any) => {
        this.calendarApi.addEvent(this.parsEvent(element));
        console.log(this.parsEvent(element));
        
        });
      },
      error:err=>{
        console.log('err');
        console.log(err);
      }
    });
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
    const args=this.datSelectionArg;
    if(!args){
      console.log("select a date range");
      
    }else{
      this.form.startDate=this.datepipe.transform(args.start,'yyyy-MM-dd')||'';
      this.form.endDate=this.datepipe.transform(args.end,'yyyy-MM-dd')||'';
      if(!args.allDay){
        this.form.startTime=this.datepipe.transform(args.start,'HH:mm')||'';
        this.form.endTime=this.datepipe.transform(args.end,'HH:mm')||'';
      }

      this.showModel();
    }
  }
  showModel(){
    this.blockHostListener=true;
    this.modelShowen=true;
    setTimeout(() => {
      this.fadeModel=true;
    }, 10);
    setTimeout(() => {
      this.blockHostListener=false;
    }, 300);
  }
  closeModel(){
    this.fadeModel=false;
    this.form={event:'',startDate:'',startTime:'',endDate:'',endTime:'',}
    setTimeout(() => {
      this.modelShowen=false;
    }, 150);
  }
  submitModal(){
    if(this.form.event==='')this.form.event="My Event";
    console.log(this.form);
    if(this.form.startDate=='')this.form.startTime=='';
    if(this.form.endDate=='')this.form.endTime=='';
    if(this.form.startDate===''&&this.form.endDate===''){
      console.log("no date was provided");
    }else{
      if(this.form.startDate===''&&this.form.endDate!==''){
        this.form.startDate=this.form.endDate;
      }
      const start:Date=new Date(this.form.startDate+'T'+(this.form.startTime!==''?this.form.startTime:'00:00'));
      const end:Date=new Date(this.form.endDate+'T'+(this.form.endTime!==''?this.form.endTime:'00:00'));
      const event:EventInput={ title: this.form.event,start:start,end:end,allDay:(this.form.startTime==''&&this.form.endTime=='') }
      this.calendarApi.addEvent(this.parsEvent(event));
      this.authService.addEvent(event).subscribe({
        next:data=>{
          console.log('data');
          console.log(data);
        },
        error:err=>{
          console.log('err');
          console.log(err);
        }
      });
      console.log("event");
      console.log(event);
    }
    
    this.closeModel();

    
  }
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(!this.modalDialog.nativeElement.contains(event.target)&&!this.blockHostListener){
      this.closeModel();
    }
  }
  parsEvent(data:any):EventInput{
    return { title:data.title,start:data.start,end:data.end,allDay:data.allDay}
  }
}
