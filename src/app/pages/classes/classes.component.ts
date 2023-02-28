import { Component , OnInit, OnDestroy, ViewChild, ElementRef, HostListener} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { User } from 'app/Interfaces/user';
import { EventsService } from 'app/services/events.service';
import { StudentService } from "app/_services/student.service";
import { DatePipe } from '@angular/common';
import { parsegrade,parseroles,getmainrole, getmainrolecode, parsesubject ,parsesubjectIcon } from 'app/functions/parsers';
@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit, OnDestroy {
  oppenedtab:number=1;
  uuidDisplay=false;
  retreaveduuid:string='';
  expandAddcard:boolean=false;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  submiterrcode:number=-1;
  submiterrstr:string='';
  submittduuid:string='';
  user: User = null as any;
  MyClasses:any[]=[];
  chosenClass:any=null;
  chosenIndex:number=-1;
  blockHostListener: boolean=false;
  submited=false;
  loading: boolean=false;
  classesenrollCount:number=0;
  loadingClasses: boolean=true;

  @ViewChild("cardAdd") cardAdd!: ElementRef;
  
  constructor(private events: EventsService,private StudentService:StudentService,private storageService: StorageService) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription = this.events.userdataEvent.subscribe(
      state => {
        console.log("userdataEvent 11");
        if(state.state==this.events.UPDATEUSER){
          this.user=state.userdata;
          this.classesenrollCount = this.user.info.classesenrollCount;
        }
        if(state.state==this.events.DALETEUSER){
          this.user=null as any;
        }
      }
    )
    this.getClasses();
  }
  getClasses(){
    this.subscription1=this.StudentService.getClasses().subscribe({

      next:data=>{
        console.log('get student classses data',data);
        this.MyClasses=data.classes.sort(function(a:any,b:any){          
          return (b.accepted?1:0)-(a.accepted?1:0)
        })
          this.loadingClasses=false;
      },
      error:err=>{
        console.log('get student classes error',err);
        
      }
    })
  }
  oppenTab(ind:number){
    this.oppenedtab=ind;
  }
  oppenAddClass(error:any){
    this.blockHostListener=true;
    setTimeout(() => {
      this.blockHostListener=false;
    }, 100);
    if(!this.expandAddcard){
      this.expandAddcard=true;
        setTimeout(() => {
          this.uuidDisplay=true;
        }, 500);
    }else{
      console.log("submit");
      this.submit(error);

    }
  }
  closeAddClass(){
    this.expandAddcard=false;
    this.uuidDisplay=false;
  }
  clear(){
    this.submiterrcode=-1;
    this.submiterrstr='';
  }
  submit(error:any){
    this.clear;
    console.log(error);
    if(!error&&!this.loading){
      this.loading=true;
      this.submittduuid=this.retreaveduuid;
      this.StudentService.enroll(this.retreaveduuid).subscribe({
        next:data=>{
          this.submited=false;
          this.closeAddClass();
          this.classesenrollCount=data.count;
          let tempp=this.user.info;
          tempp.classesenrollCount=this.classesenrollCount;
          this.storageService.alterUser({info:tempp});
          this.getClasses();
          this.loading=false;
        },
        error:err=>{
          console.log('enroll error',err);
          this.loading=false;
          if(err.status==565){
            this.submiterrcode=565;
            this.submiterrstr='class not found';
          }
          if(err.status==566){
            this.submiterrcode=566;
            this.submiterrstr='alredy registered ';
          }
        }
      })
    }
    this.submited=true;
  }
  chooseClass(id:number){
    if( this.chosenIndex!=id){
      this.chosenIndex=id;
      this.chosenClass=this.MyClasses[id];
    }else{
      this.chosenIndex=-1;
      this.chosenClass=null;
    }
  }
  parsesubject(subject:number):string{
    return parsesubject(subject);
  }
  parsesubjectIcon(subject:number):string{
    return parsesubjectIcon(subject);
  }
  @HostListener('document:click', ['$event'])
  clickout(event:any) {
    if(!this.cardAdd.nativeElement.contains(event.target)&&!this.blockHostListener&&this.expandAddcard){
      this.closeAddClass();
    }
  }
}
