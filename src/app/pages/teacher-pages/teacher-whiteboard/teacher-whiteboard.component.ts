import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { DatePipe } from '@angular/common';
import { WhiteboardComponent } from 'app/pages/whiteboard/whiteboard.component';
import { register } from 'swiper/element/bundle';
register();
@Component({
  selector: 'app-teacher-whiteboard',
  templateUrl: './teacher-whiteboard.component.html',
  styleUrls: ['./teacher-whiteboard.component.scss'],
})
export class TeacherWhiteboardComponent  implements OnInit, OnDestroy {
  @ViewChild('dataContainer') dataContainer?: ElementRef;
  @ViewChild("WboardnameinputBox") WboardnameinputBox!: ElementRef;
  @ViewChild("Wboardnameinput") Wboardnameinput!: ElementRef;
  @ViewChild("cardBody") cardBody!: ElementRef;
  @ViewChild("whiteboardComp") whiteboardComp!: WhiteboardComponent;
  @ViewChild("swiperEl") swiperEl!: ElementRef;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  chosenClass: any = null;
  editing: boolean = true; // TODO :should be false just for tests
  loading: boolean = false;
  datepipe: DatePipe = new DatePipe('en-US');
  selectedWboard: any = null;
  addnotEdit: boolean = true;
  WboardIdToedit = -1;
  Wboardnamediting = false ;
  firstskiped = false;
  form :any= {
    name:'',
    pages:[],
    pagesCount:0,
  }
  constructor(private events: EventsService, private teacherservice: TeacherService, private authService: AuthService,private sanitizer: DomSanitizer) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription1 = this.events.currentLayoutEvent.subscribe(state => {
      setTimeout(() => {
        this.resizeCanvase(null);
      }, 500);
      
    })
    this.subscription = this.events.taskEvent.subscribe(state => {
      if(this.firstskiped){
      if (state.task == this.events.TASKCHOOSECLASSES) {
        console.log("reciever class TASKCHOOSECLASSES 1", state.data.chosenClass);

        this.putClass(state.data.chosenClass)
        // if (this.selectedUser) this.selectedUser = this.chosenClass.enrollers.find((userr: any) => userr.email == this.selectedUser.email);
      }
      // if (state.task == this.events.TASKUPDATECLASSWboard) {
      //   if(state.data.tasktype==4){
      //     console.log(".tasktype==4    Wboard");
      //     this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
      //   }
      // }
      // if (state.task == this.events.TASKDELETECLASSWboardSCHEDULE) {
      //   if(this.chosenClass&&this.chosenClass.uuid===state.data.classuuid){
      //     this.chosenClass.data.Wboardschedule=this.chosenClass.data.Wboardschedule.filter((ntf:any)=>ntf!=state.data.id);
      //   }
      // }
    }else this.firstskiped = true
    })
    this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
  }
  putClass(classe: any) {
    this.chosenClass = classe;
    if (classe) {
      // this.showDD = Array(classe.data.Wboardications.length).fill(false);
      console.log("newWboardCount",this.chosenClass.newWboardCount);
    }
  }
  addWboard() {
    this.form = { 
      name:'New Whiteboard', 
      pages:[{json:this.whiteboardComp.canvas.toJSON(),svg:this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG())}], 
      pagesCount:1
    }
    // this.formInvalid = -1;
    // this.formInvalidmsg = '';
    this.openWhitboard(true);
  }
  openWhitboard(editting:boolean){
    this.editing = true;
    this.addnotEdit = editting;
    console.log("card width: ",this.cardBody.nativeElement.offsetWidth);
    const width=this.cardBody.nativeElement.offsetWidth-50;
    this.whiteboardComp.setSize(width);
  }
  editName(){
    this.Wboardnamediting = true ;
    setTimeout(()=>{ // this will make the execution after the above boolean has changed
      this.Wboardnameinput.nativeElement.focus();
    },0);  
  }
  editWboard(ind: number) {
    const Notlength=this.chosenClass.data.Wboardications.length;
    console.log("Wboardications.length",this.chosenClass.data.Wboardications.length);
    console.log("ind",ind);
    console.log("Notlength",Notlength);
    console.log("Notlength-1-ind",Notlength-1-ind);
    this.form = {
      name: this.chosenClass.data.Wboardications[Notlength-1-ind].name ,
      pages: this.chosenClass.data.Wboardications[Notlength-1-ind].pages ,//2023-03-22T00:31
      pagesCount: this.chosenClass.data.Wboardications[Notlength-1-ind].pagesCount
    }
    // console.log("this.chosenClass.data.Wboardications[ind]", this.chosenClass.data.Wboardications[Notlength-1-ind]);
    this.WboardIdToedit = this.chosenClass.data.Wboardications[Notlength-1-ind].id;
    // this.formInvalid = -1;
    // this.formInvalidmsg = '';
    this.editing = true;
    this.addnotEdit = false;
    // this.toggleDD(this.openedDD);
  }
  removeWboard(ind: number) {
    // TODO add confirmation dialog 
    const Notlength=this.chosenClass.data.Wboardications.length;
    const WboardToDelete = this.chosenClass.data.Wboardications[Notlength-1-ind].id;
    // this.teacherservice.removeclassWboard(this.chosenClass.uuid, WboardToDelete).subscribe({
    //   next: data => {
    //     console.log("removeclassWboard : ", data);
    //     this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 3, classid: this.chosenClass.uuid, WboardId: WboardToDelete } });
    //     // this.toggleDD(this.openedDD);
    //     this.chosenClass.data.Wboardications = this.chosenClass.data.Wboardications.filter((ntf: any) => ntf.id != WboardToDelete);
    //   },
    //   error: err => {
    //     console.log('err');
    //     console.log(err);
    //   }
    // });
  }
  onSubmit(): number {
    let WboardTosend: any = {...this.form};
    if (this.addnotEdit) {
      // this.teacherservice.addclassWboard(this.chosenClass.uuid, WboardTosend).subscribe({
      //   next: data => {
      //     console.log("addclassWboard : ", data);
      //     this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 1, classid: this.chosenClass.uuid, Wboard: data.Wboard } });
      //     // this.chosenClass.data.Wboardications.push(data.Wboard);
      //     this.backToList();
      //   },
      //   error: err => {
      //     console.log('err');
      //     console.log(err);
      //   }
      // });
    } else {
      WboardTosend.id = this.WboardIdToedit;
      this.editWboardSubmit(WboardTosend,0);
    }
    return 0
  }
  editWboardSubmit(WboardTosend: any,task:number) {
    console.log("this.WboardIdToedit", this.WboardIdToedit);
    // this.teacherservice.editclassWboard(this.chosenClass.uuid, WboardTosend,task).subscribe({
    //   next: data => {
    //     console.log("editclassWboard : ", data);
    //     // const index = this.chosenClass.data.Wboardications.findIndex((Wboardf:any)=>Wboardf.id==data.Wboard.id);
    //     //   if(index){
    //     //     this.chosenClass.data.Wboardications[index] = data.Wboard
    //     //   }
    //     this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 2, classid: this.chosenClass.uuid, Wboard: data.Wboard } });
    //     // if(data.Wboard.status==3)this.events.changeTaskState({ task: this.events.TASKDELETECLASSWboardSCHEDULE, data: { classuuid:this.chosenClass.uuid, id:data.Wboard.id} })
    //     this.backToList();
    //   },
    //   error: err => {
    //     console.log('err');
    //     console.log(err);
    //   }
    // });
  }
  clean() {
    this.form = { name:'', pages:[], pagesCount:0};
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.clean();
    this.editing = false;
    console.log("backToList");
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.Wboardnamediting ) {
      if (!this.WboardnameinputBox?.nativeElement.contains(event.target)) {
        this.Wboardnamediting = false;
      }
    }

  }
  @HostListener('window:resize', ['$event'])
  resizeCanvase(event: any) {
    if (this.editing ) {
      
      // this.whiteboardComp.setSize(width,height);
      setTimeout(() => {
        const width=this.cardBody.nativeElement.offsetWidth-50;
        this.whiteboardComp.setSize(width);
      }, 500);
      
    }
  }

  // ----------------------------- slider ----------------------------- //
nextslide(){
  this.swiperEl.nativeElement.swiper.slideNext();
}
prevtslide(){
  this.swiperEl.nativeElement.swiper.slidePrev();
}
}