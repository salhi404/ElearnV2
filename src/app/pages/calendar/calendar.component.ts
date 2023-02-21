import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Calendar, CalendarOptions, DateSelectArg, EventClickArg, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"
import listGridPlugin from '@fullcalendar/list';
import { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../_services/auth.service';
import { EventImpl } from '@fullcalendar/core/internal';
import { parsegrade,parseroles,getmainrole, getmainrolecode, parsesubject ,parsesubjectIcon } from 'app/functions/parsers';
const views =["dayGridMonth","timeGridWeek","timeGridDay","listMonth","listWeek","listDay"];
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @ViewChild(FullCalendarComponent) calendarElement!: FullCalendarComponent;
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  @ViewChild("modalDialogDelete") modalDialogDelete!: ElementRef;
  @ViewChild("moreDD") moreDD!: ElementRef;
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
  tempId:string='';
  tests:EventImpl=null as any;
  allEvents:any[]=[];
  dateIsSelected:boolean=false;
  colorInput:string='#6c757d';
  DeleteclickedEvent=false;
  addnotEditEvent=true;
  clicktodelete=false;
  eventToDelete:string='-1';
  EditclickedEvent=false;
  clicktoEdit=false;
  eventToEdit:string='-1';
  datepipe: DatePipe = new DatePipe('en-US');
  modelShowen:boolean=false;
  showDD:boolean=false;
  blockcloseDD:boolean=false;
  calendarTitle = "";
  dateselected:boolean=false;
  fadeModel=false;
  modelShowenDelete=false;
  fadeModelDelete=false;
  viewType: number = 0;
  islistview:boolean=false;
  datSelectionArg:DateSelectArg=null as any;
  calendarApi: Calendar = null as any;
  MyClasses:any[]=[];
  personalEvents:any=null;
  calendarOptions: CalendarOptions = {
    eventDisplay:"block",
    initialView: 'dayGridMonth',
    eventClick: this.handleEventClick(), // MUST ensure `this` context is maintained
    eventMouseEnter:this.handleEventEnter(),
    eventMouseLeave:this.handleEventLeave(),
    events: this.events,
    locale: 'en-GB',
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    selectable: true,
    unselectCancel:'.preventunselect'
    ,
    select:(arg)=>{
      this.dateselected=true;
      this.datSelectionArg=arg;
    }
    ,
    unselect:()=>{
      this.datSelectionArg=null as any;
      this.dateselected=false;
    },
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin,listGridPlugin],
    headerToolbar: false,
    /*{
      start: 'title', // will normally be on the left. if RTL, will be on the right
      center: 'dayGridMonth timeGridWeek timeGridDay',
      end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    }*/
  };

  handleEventClick(){
    const context=this;
    return (args: EventClickArg) =>{ 
      if(this.DeleteclickedEvent){
        console.log("deleeeeeet");
        context.eventToDelete=args.event.id;
        context.showDeleteModal();
      }
      if(this.EditclickedEvent){
        context.eventToEdit=args.event.id;
        console.log("ediiiiit"+context.eventToEdit);
        this.form.event=args.event.title;
        this.form.startDate=this.datepipe.transform(args.event.start,'yyyy-MM-dd')||'';
        this.form.endDate=this.datepipe.transform(args.event.end,'yyyy-MM-dd')||'';
        if(!args.event.allDay){
          this.form.startTime=this.datepipe.transform(args.event.start,'HH:mm')||'';
          this.form.endTime=this.datepipe.transform(args.event.end,'HH:mm')||'';
        }
        this.colorInput=args.event.backgroundColor;
        this.addnotEditEvent=false;
        this.showModel(1);
       // context.showDeleteModal();
      }
  
    }
  }
  handleEventEnter(){
    const context=this;
    return (args:any ) =>{ 
      if(this.DeleteclickedEvent){
        console.log("enteer");
      }
  
    }
  }
  handleEventLeave(){
    const context=this;
    return (args:any) =>{ 
      if(this.DeleteclickedEvent){
        console.log("leave");
      }
  
    }
  }
  constructor(private cdr: ChangeDetectorRef,private authService: AuthService) { }
  test() {
    console.log(this.calendarApi.view.title);
  }
  ngOnInit(): void {
    //this.calendarApi=this.calendarComponent.getApi();
    //console.log(this.calendarApi.view);
   // this.nextView();

  }
  ngAfterViewInit() {
    this.calendarApi = this.calendarElement.getApi();
    this.calendarTitle = this.calendarApi.view.title;
    this.cdr.detectChanges();
    this.getEvents();
  }
  getEvents(){
    this.authService.getEvents().subscribe({
      next:data=>{
        console.log("getEvents",data);
        this.MyClasses=[];
        data.events.forEach((element:any) => {
          element.class.chosen=true;
          element.class.count=element.data.length;
          if(element.class.uuid!=='personal'){
            this.MyClasses.push(element);
          }else{
            this.personalEvents=element;
          }
          element.data.forEach((ell:any) => {
            ell.id=element.class.uuid+ell.id;
            this.calendarApi.addEvent(this.parsEvent(ell));
            console.log("ell",ell);
          });   
        
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
    this.calendarApi.changeView(views[this.viewType+(this.islistview?1:0)*3])
    this.calendarTitle = this.calendarApi.view.title;
  }
  changetype(){
    this.islistview=!this.islistview;
    this.calendarApi.changeView(views[this.viewType+(this.islistview?1:0)*3])
    this.calendarTitle = this.calendarApi.view.title;
  }
  addevent(){
    this.showDD=false;
    console.log(this.datSelectionArg);
    const args=this.datSelectionArg;
    this.dateIsSelected=!args;
    if(!args){
      console.log("select a date range");
      this.form.startDate=this.datepipe.transform(new Date(),'yyyy-MM-dd')||'';
      this.form.endDate=this.datepipe.transform(new Date(),'yyyy-MM-dd')||'';
    }else{
      this.form.startDate=this.datepipe.transform(args.start,'yyyy-MM-dd')||'';
      this.form.endDate=this.datepipe.transform(args.end,'yyyy-MM-dd')||'';
      if(!args.allDay){
        this.form.startTime=this.datepipe.transform(args.start,'HH:mm')||'';
        this.form.endTime=this.datepipe.transform(args.end,'HH:mm')||'';
      }
    }
    this.addnotEditEvent=true;
    this.showModel(1);
    
  }
  showDeleteModal(){
    this.allEvents=this.calendarApi.getEvents();
    if(this.allEvents.length==0){
      this.DeleteclickedEvent=true;
      this.showDD=false;
    //   this.blockHostListener=true;
    // setTimeout(() => {
    //   this.blockHostListener=false;
    // }, 300);
    }else{
      this.showDD=false;
      this.showModel(2);
    }
  }
  ShowDD(){
    this.showDD=!this.showDD;
    this.blockcloseDD=true;
    setTimeout(() => {
      this.blockcloseDD=false;
    }, 300);
  }
  showModel(ind:number){
    this.blockHostListener=true;
    if(ind==1)this.modelShowen=true;
    if(ind==2)this.modelShowenDelete=true;
    setTimeout(() => {
      if(ind==1)this.fadeModel=true;
      if(ind==2)this.fadeModelDelete=true;
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
  closeModelDelete(){
    this.fadeModelDelete=false;
    
    setTimeout(() => {
      this.modelShowenDelete=false;
      this.eventToDelete='-1';
    }, 150);
  }
  DeleteEvent(isSelect:boolean){
    if(isSelect){
      this.DeleteclickedEvent=true;
      this.closeModelDelete();
    }else{
      const id=this.eventToDelete;
      this.calendarApi.getEventById(id)?.remove();
      this.authService.DeleteEvent(id).subscribe({
        next:data=>{
          console.log('data delete');
          console.log(data);
        },
        error:err=>{
          console.log('err delete');
          console.log(err);
        }
      });
      this.closeModelDelete();
    }
  }
  selectEvent(){
    this.allEvents=this.calendarApi.getEvents();
    this.EditclickedEvent=true;
    this.closeModel();
  }
  editEvent(){
    this.allEvents=this.calendarApi.getEvents();
    this.eventToEdit="-1"
    this.addnotEditEvent=false;
    this.showModel(1);
    this.showDD=false;
  }
  editoption(){
   // this.eventToEdit=this.allEvents[ind].id;
   const eventt=this.allEvents.find(ev=>ev.id==this.eventToEdit)
   console.log("editoption",eventt);
   if(eventt){
    this.form.event=eventt.title;
    this.form.startDate=this.datepipe.transform(eventt.start,'yyyy-MM-dd')||'';
    this.form.endDate=this.datepipe.transform(eventt.end,'yyyy-MM-dd')||'';
    if(!eventt.allDay){
      this.form.startTime=this.datepipe.transform(eventt.start,'HH:mm')||'';
      this.form.endTime=this.datepipe.transform(eventt.end,'HH:mm')||'';
    }
    this.colorInput=eventt.backgroundColor;
   }else{
    this.form={event:'',startDate:'',startTime:'',endDate:'',endTime:'',}
   }
   
    
  }
  submitModal(){
    if(this.form.event==='')this.form.event="My Event";
    console.log(this.form);
    if(this.form.startDate==='')this.form.startTime==='';
    if(this.form.endDate==='')this.form.endTime==='';
    if(this.form.startDate===''&&this.form.endDate===''){
      console.log("no date was provided");
    }else{
      if(this.form.startDate===''&&this.form.endDate!==''){
        this.form.startDate=this.form.endDate;
      }
      const start:Date=new Date(this.form.startDate+'T'+(this.form.startTime!==''?this.form.startTime:'00:00'));
      const end:Date=new Date(this.form.endDate+'T'+(this.form.endTime!==''?this.form.endTime:'00:00'));
      const event:EventInput={ title: this.form.event,start:start,end:end,allDay:(this.form.startTime==''&&this.form.endTime==''),color:this.colorInput }
      this.tempId=this.datepipe.transform(new Date(),'MM_dd_hh_mm_ss')||'temp123';
      const tempevent:EventInput={ title: this.form.event,start:start,end:end,allDay:(this.form.startTime==''&&this.form.endTime==''),color:this.colorInput,id:this.tempId }
      if(this.addnotEditEvent){
        this.calendarApi.addEvent(this.parsEvent(tempevent));
        this.authService.addEvent(event).subscribe({
          next:data=>{
            console.log('data addEvent');
            console.log(data);
            this.calendarApi.getEventById(this.tempId)?.setProp('id',data.event.id);
          },
          error:err=>{
            console.log('err');
            console.log(err);
          }
        });
        console.log("event");
        console.log(event);
      }else{
        console.log("submi edit event");
        console.log(event);
        console.log("id :"+this.eventToEdit);
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('title',event.title);
        if(event.start)this.calendarApi.getEventById(this.eventToEdit)?.setStart(event.start);
        if(event.end)this.calendarApi.getEventById(this.eventToEdit)?.setEnd(event.end);
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('allDay',event.allDay);
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('color',event.color);
        this.authService.editEvent(event,this.eventToEdit).subscribe({
          next:data=>{
            console.log('data EditEvent');
            console.log(data);
          },
          error:err=>{
            console.log('err');
            console.log(err);
          }
        });
      }
      }

    
    this.closeModel();

    
  }
  parsesubject(subject:number):string{
    return parsesubject(subject);
  }
  parsesubjectIcon(subject:number):string{
    return parsesubjectIcon(subject);
  }
  toggleClass(ind:number){
    const classAt = ind!=-1?this.MyClasses[ind]:this.personalEvents;
    classAt.class.chosen=!classAt.class.chosen;
    if( classAt.class.chosen){
      classAt.data.forEach((element:any) => {
        this.calendarApi.addEvent(this.parsEvent(element));
      });
    }else{
      classAt.data.forEach((element:any) => {
        console.log("toggleClass",element.id);
        this.calendarApi.getEventById(element.id)?.remove();
      });
    }
  }
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(!this.modalDialog.nativeElement.contains(event.target)&&!this.blockHostListener&&!this.modelShowenDelete){
      this.closeModel();
    }
    if(!this.modalDialogDelete.nativeElement.contains(event.target)&&!this.blockHostListener&&!this.modelShowen){
      this.closeModelDelete();
    }
    
    if(!this.moreDD.nativeElement.contains(event.target)&&!this.blockcloseDD){
      this.showDD=false;
    }
    if(this.clicktodelete){
      this.clicktodelete=false;
      this.DeleteclickedEvent=false;
    }
    setTimeout(() => {
      if(this.DeleteclickedEvent)this.clicktodelete=true;
    }, 100);
    if(this.clicktoEdit){
      this.clicktoEdit=false;
      this.EditclickedEvent=false;
    }
    setTimeout(() => {
      if(this.EditclickedEvent)this.clicktoEdit=true;
    }, 100);

  }
  parsEvent(data:any):EventInput{
    return { title:data.title,start:data.start,end:data.end,allDay:data.allDay,color:data.color,id:data.id}
  }
}
