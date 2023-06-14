import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

import { Subscription } from 'rxjs';
import { EventsService } from 'app/services/events.service';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { DatePipe } from '@angular/common';
import { SlideboardComponent } from '../slideboard/slideboard.component';
import { register } from 'swiper/element/bundle';
register();
@Component({
  selector: 'app-teacher-whiteboard',
  templateUrl: './teacher-whiteboard.component.html',
  styleUrls: ['./teacher-whiteboard.component.scss'],
})
export class TeacherWhiteboardComponent implements OnInit, OnDestroy {
  @ViewChild('dataContainer') dataContainer?: ElementRef;
  @ViewChild("WboardnameinputBox") WboardnameinputBox!: ElementRef;
  @ViewChild("Wboardnameinput") Wboardnameinput!: ElementRef;
  @ViewChild("cardBody") cardBody!: ElementRef;
  @ViewChild("SlideboardComponent") SlideComp!: SlideboardComponent;
 
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  chosenClass: any = null;
  editing: boolean = false;
  loading: boolean = false;
  datepipe: DatePipe = new DatePipe('en-US');
  selectedWboard: any = null;
  addnotEdit: boolean = true;
  WboardIdToedit = -1;
  Wboardnamediting = false;
  oldWboardname:string='';
  firstskiped = false;





  constructor(private events: EventsService, private teacherservice: TeacherService, private authService: AuthService, ) { }
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
      if (this.firstskiped) {
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
      } else this.firstskiped = true
    })
    this.events.changeTaskState({ task: this.events.TASKGETCHOSENCLASS, data: null });
  }
  putClass(classe: any) {
    this.chosenClass = classe;
    if (classe) {
      // this.showDD = Array(classe.data.whiteboards.length).fill(false);
      console.log("newWboardCount", this.chosenClass.newWboardCount);
    }
  }
  addWboard() {
    this.SlideComp.whiteboardComp.clearCanvas();
    let tempName ='New Whiteboard';
    for (let ind = 1; ind < 100; ind++) {
      let found = this.chosenClass.data.whiteboards.find((wb:any)=>(wb.name === tempName))
      console.log("found ",found);
      
      if(found) tempName ='New Whiteboard ( '+ind+' )';
      else break
    }
    this.SlideComp.form = {
      name: tempName,
      pages: [{ test:this.SlideComp.currentPage+1,json: this.SlideComp.whiteboardComp.canvas.toJSON(),svg:this.SlideComp.whiteboardComp.canvas.toSVG(), secSvg: this.SlideComp.sanitizer.bypassSecurityTrustHtml(this.SlideComp.whiteboardComp.canvas.toSVG())}],
      pagesCount: 1 
    }
    this.SlideComp.currentPage = 0;
    // this.chooseSlide(0);
    let WboardTosend: any = { name:this.SlideComp.form.name,pages:this.onlySvgFromPages(this.SlideComp.form.pages),pagesCount:this.SlideComp.form.pagesCount };
      this.teacherservice.addclassWboard(this.chosenClass.uuid, WboardTosend).subscribe({
        next: data => {
          console.log("addclassWboard 11 : ", data);
          this.WboardIdToedit=data.Wboard.id;
          this.chosenClass.data.whiteboards.push(data.Wboard);
          // this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 1, classid: this.chosenClass.uuid, Wboard: data.Wboard } });
          // this.chosenClass.data.whiteboards.push(data.Wboard);
          // this.backToList();
        },
        error: err => {
          console.log('err');
          console.log(err);
        }
      });
    this.openWhitboard(true);
  }

  openWhitboard(editting: boolean) {
    this.editing = true;
    this.addnotEdit = editting;
    this.SlideComp.blockSaveOnOpen=true;
    console.log("card width: ", this.cardBody.nativeElement.offsetWidth);
    const width = this.cardBody.nativeElement.offsetWidth - 50;
    this.SlideComp.whiteboardComp.setSize(width);
    this.SlideComp.wbIsSaved=true;
    console.log("to true 3");
  }
  editName() {
    this.Wboardnamediting = true;
    this.oldWboardname = this.SlideComp.form.name;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.Wboardnameinput.nativeElement.focus();
    }, 0);
  }
  editWboard(ind: number) {
    this.SlideComp.blockmodif=true;
    const Notlength = this.chosenClass.data.whiteboards.length;
    console.log("edit whiteboard", this.chosenClass.data.whiteboards[Notlength - 1 - ind]);
    
    this.SlideComp.form = {
      name: this.chosenClass.data.whiteboards[Notlength - 1 - ind].name,
      pages: this.addSecSvgToPages(this.chosenClass.data.whiteboards[Notlength - 1 - ind].pages),//2023-03-22T00:31
      pagesCount: this.chosenClass.data.whiteboards[Notlength - 1 - ind].pagesCount
    }
    // this.SlideComp.form.pages.forEach((page:any) => {
    //   page.svg=this.sanitizer.bypassSecurityTrustHtml(this.SlideComp.whiteboardComp.canvas.toSVG())
    // });
    // console.log("this.chosenClass.data.whiteboards[ind]", this.chosenClass.data.whiteboards[Notlength-1-ind]);
    this.WboardIdToedit = this.chosenClass.data.whiteboards[Notlength - 1 - ind].id;
    // this.SlideComp.formInvalid = -1;
    // this.SlideComp.formInvalidmsg = '';
    this.openWhitboard(false);
    this.SlideComp.currentPage = 0;
    this.SlideComp.chooseSlide(0);
    // this.toggleDD(this.openedDD);
    this.SlideComp.blockmodif=false;
  }
  saveBoard(){
    console.log("save changes");
    let WboardTosend: any = { name:this.SlideComp.form.name,pages:this.onlySvgFromPages(this.SlideComp.form.pages),pagesCount:this.SlideComp.form.pagesCount ,id:this.WboardIdToedit}; 
      this.teacherservice.editclassWboard(this.chosenClass.uuid, WboardTosend).subscribe({
      next: data => {
        console.log("editclassWboard : ", data);

        const index = this.chosenClass.data.whiteboards.findIndex((Wboardf:any)=>Wboardf.id==data.Wboard.id);
          if(index!=-1){
            this.chosenClass.data.whiteboards[index] = data.Wboard
          }
        // this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 2, classid: this.chosenClass.uuid, Wboard: data.Wboard } });
        // if(data.Wboard.status==3)this.events.changeTaskState({ task: this.events.TASKDELETECLASSWboardSCHEDULE, data: { classuuid:this.chosenClass.uuid, id:data.Wboard.id} })
        // this.backToList();
      },
      error: err => {
        console.log('err');
        console.log(err);
      }
    });
  }
  removeWboard(ind: number) {
    // TODO add confirmation dialog 
    const Notlength = this.chosenClass.data.whiteboards.length;
    const WboardToDelete = this.chosenClass.data.whiteboards[Notlength - 1 - ind].id;
    this.teacherservice.removeclassWboard(this.chosenClass.uuid, WboardToDelete).subscribe({
      next: data => {
        console.log("removeclassWboard : ", data);
        // this.events.changeTaskState({ task: this.events.TASKUPDATECLASSWboard, data: { tasktype: 3, classid: this.chosenClass.uuid, WboardId: WboardToDelete } });
        // this.toggleDD(this.openedDD);
        this.chosenClass.data.whiteboards = this.chosenClass.data.whiteboards.filter((ntf: any) => ntf.id != WboardToDelete);
      },
      error: err => {
        console.log('err');
        console.log(err);
      }
    });
  }
  clean() {
    this.SlideComp.form = { name: '', pages: [], pagesCount: 0 };
  }
  backToList() {
    //this.SlideComp.form={user:false,teacher:false,moderator:false,admin:false}
    this.clean();
    this.editing = false;
    this.WboardIdToedit=-1;
    this.SlideComp.wbIsSaved=true;
    console.log("backToList");
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.Wboardnamediting) {
      if (!this.WboardnameinputBox?.nativeElement.contains(event.target)) {
        this.Wboardnamediting = false;
        if(this.oldWboardname!== this.SlideComp.form.name )this.SlideComp.wbIsSaved=false;
      }
    }

  }
  @HostListener('window:resize', ['$event'])
  resizeCanvase(event: any) {
    if (this.editing) {

      // this.SlideComp.whiteboardComp.setSize(width,height);
      setTimeout(() => {
        const width = this.cardBody.nativeElement.offsetWidth - 50;
        this.SlideComp.whiteboardComp.setSize(width);
      }, 500);

    }
  }





  onlySvgFromPages(Pages:any):any{
    return Pages.map((elem:any)=>{return {json:elem.json,svg:elem.svg}});
  }
  addSecSvgToPages(Pages:any):any{
    return Pages.map((elem:any)=>{return {json:elem.json,svg:elem.svg,secSvg:this.SlideComp.sanitizer.bypassSecurityTrustHtml(elem.svg)}});
  }
}