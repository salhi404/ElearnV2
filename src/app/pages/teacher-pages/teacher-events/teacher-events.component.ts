import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Calendar, CalendarOptions, DateSelectArg, EventClickArg, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listGridPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction"
import { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { DatePipe } from '@angular/common';
import { AuthService } from 'app/_services/auth.service';
import { EventImpl } from '@fullcalendar/core/internal';


import { Subject, Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { TeacherService } from 'app/_services/teacher.service';
import { parsesubject, parsesubjectIcon, parsegrade } from 'app/functions/parsers';
import { el } from '@fullcalendar/core/internal-common';
const views =["dayGridMonth","timeGridWeek","timeGridDay","listMonth","listWeek","listDay"];
@Component({
  selector: 'app-teacher-events',
  templateUrl: './teacher-events.component.html',
  styleUrls: ['./teacher-events.component.scss']
})
export class TeacherEventsComponent implements OnInit, AfterViewInit {
  //-------------------------------------------------------------------------------
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  chosenClass: any = null;
  
  //-------------------------------------------------------------------------------
  
  @ViewChild(FullCalendarComponent) calendarElement!: FullCalendarComponent;
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  @ViewChild("modalDialogDelete") modalDialogDelete!: ElementRef;
  @ViewChild("moreDD") moreDD!: ElementRef;
  blockHostListener:boolean=false;
  optionsevents: EventSourceInput = [
    /*{ title: 'event 1', date: '2023-01-01', },
    { title: 'event 2', start: new Date() , end:'2023-01-30',color:'red'}*/
  ]
  form={event:'',startDate:'',startTime:'',endDate:'',endTime:'',Recurring :false,type:'0'}
  tempId:string='';
  tests:EventImpl=null as any;
  allEvents:any[]=[];
  dateIsSelected:boolean=false;
  colorInput:string='#007bff';
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
  calendarTitle = "sssssss";
  dateselected:boolean=false;
  fadeModel=false;
  modelShowenDelete=false;
  fadeModelDelete=false;
  viewType: number = -1;
  islistview:boolean=false;
  datSelectionArg:DateSelectArg=null as any;
  calendarApi: Calendar = null as any;
  oldEventType='0';
  calendarOptions: CalendarOptions = {
    eventDisplay:"block",
    initialView: 'dayGridMonth',
    eventClick: this.handleEventClick(), // MUST ensure `this` context is maintained
    eventMouseEnter:this.handleEventEnter(),
    eventMouseLeave:this.handleEventLeave(),
    events: this.optionsevents,
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
  constructor(private events: EventsService, private teacherservice: TeacherService,private cdr: ChangeDetectorRef,private authService: AuthService) { }
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
    this.subscription = this.events.taskEvent.subscribe(state => {
      if (state.task == this.events.TASKCHOOSECLASSES) {
        this.chosenClass = state.data.chosenClass;
        if(this.chosenClass)this.loadevents(); //this.getclassevents(this.chosenClass.uuid);
      }
      if (state.task == this.events.TASKCONNECTEDRECIEVED) {
        if(this.chosenClass&&this.chosenClass.uuid===state.data.connectedfor) this.chosenClass = state.data.chosenClass;
      }
    })
    this.events.changeTaskState({task:this.events.TASKGETCHOSENCLASS,data:null})
    this.nextView();
    this.cdr.detectChanges();
    if(this.chosenClass)this.loadevents();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }

  updateType(){
    setTimeout(() => {
      switch (this.form.type) {
        case '0':
          if(this.oldEventType!='0') {
            this.form.event="";
            this.colorInput="#007bff";
          }
          break;  
        case '1':
          this.form.event="live Stream";
          this.colorInput="#dc3545";
          if(this.form.startDate!==''){
            this.form.endDate=this.form.startDate;
          }else{
            if(this.form.endDate!==''){
              this.form.startDate=this.form.endDate;
            }
          }
          break;
      
      }
      this.oldEventType=this.form.type;
    }, 10);

  }









//-----------------------------------------------------------------------------------------------------
/*getclassevents(uuid:string){

  this.teacherservice.getClassEvents(uuid).subscribe({
    next:data=>{
      var eventSources = this.calendarApi.getEvents()
      var len = eventSources.length;
      for (var i = 0; i < len; i++) { 
          eventSources[i].remove(); 
      }
      console.log("getclassevents data",data);
      data.events.forEach((element:any) => {
      this.calendarApi.addEvent(this.parsEvent(element));
      });
    },
    error:err=>{
      console.log('err');
      console.log(err);
    }
  });
}*/
loadevents(){
  var eventSources = this.calendarApi.getEvents();
  var len = eventSources.length;
  for (var i = 0; i < len; i++) { 
      eventSources[i].remove(); 
  }
  this.chosenClass.data.events.forEach((element:any) => {
  this.calendarApi.addEvent(this.parsEvent(element));
  });
}
  handleEventClick(){
    const context=this;
    return (args: EventClickArg) =>{ 
      if(this.DeleteclickedEvent){
        context.eventToDelete=args.event.id;
        context.showDeleteModal();
      }
      if(this.EditclickedEvent){
        context.eventToEdit=args.event.id;
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
    this.form={event:'',startDate:'',startTime:'',endDate:'',endTime:'',Recurring :false,type:'0'}
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
      this.teacherservice.deleteclassevent(this.chosenClass.uuid,id).subscribe({
        next:data=>{
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
    this.form={event:'',startDate:'',startTime:'',endDate:'',endTime:'',Recurring :false,type:'0'}
   }
   
    
  }
  submitModal(){
    if(this.form.event==='')this.form.event="My Event";
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
        this.teacherservice.addclassevent(this.chosenClass.uuid,event).subscribe({
          next:data=>{
            this.calendarApi.getEventById(this.tempId)?.setProp('id',data.event.id);
          },
          error:err=>{
            console.log('err');
            console.log(err);
          }
        });
      }else{
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('title',event.title);
        if(event.start)this.calendarApi.getEventById(this.eventToEdit)?.setStart(event.start);
        if(event.end)this.calendarApi.getEventById(this.eventToEdit)?.setEnd(event.end);
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('allDay',event.allDay);
        this.calendarApi.getEventById(this.eventToEdit)?.setProp('color',event.color);
        this.teacherservice.editclassevent(this.chosenClass.uuid,this.eventToEdit,event).subscribe({
          next:data=>{
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
