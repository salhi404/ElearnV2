import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
export class TeacherWhiteboardComponent implements OnInit, OnDestroy {
  @ViewChild('dataContainer') dataContainer?: ElementRef;
  @ViewChild("WboardnameinputBox") WboardnameinputBox!: ElementRef;
  @ViewChild("Wboardnameinput") Wboardnameinput!: ElementRef;
  @ViewChild("cardBody") cardBody!: ElementRef;
  @ViewChild("whiteboardComp") whiteboardComp!: WhiteboardComponent;
  @ViewChild("swiperEl") swiperEl!: ElementRef;
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
  firstskiped = false;
  currentPage: number = -1;
  copiedPage: any = null;
  iscopying = 0;
  blockmodif:boolean=false;
  blockSaveOnOpen:boolean=false;
  wbIsSaved:boolean=true;
  form: any = {
    name: '',
    pages: [],
    pagesCount: 0,
  }
  constructor(private events: EventsService, private teacherservice: TeacherService, private authService: AuthService, private sanitizer: DomSanitizer) { }
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
    this.whiteboardComp.clearCanvas();
    let tempName ='New Whiteboard';
    for (let ind = 1; ind < 100; ind++) {
      let found = this.chosenClass.data.whiteboards.find((wb:any)=>(wb.name === tempName))
      console.log("found ",found);
      
      if(found) tempName ='New Whiteboard ( '+ind+' )';
      else break
    }
    this.form = {
      name: tempName,
      pages: [{ test:this.currentPage+1,json: this.whiteboardComp.canvas.toJSON(),svg:this.whiteboardComp.canvas.toSVG(), secSvg: this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG())}],
      pagesCount: 1 
    }
    this.currentPage = 0;
    // this.chooseSlide(0);
    let WboardTosend: any = { name:this.form.name,pages:this.onlySvgFromPages(this.form.pages),pagesCount:this.form.pagesCount };
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
  chooseSlide(ind: number) {
    this.currentPage = ind;
    this.loadcanvas(ind);
  }
  openWhitboard(editting: boolean) {
    this.editing = true;
    this.addnotEdit = editting;
    this.blockSaveOnOpen=true;
    console.log("card width: ", this.cardBody.nativeElement.offsetWidth);
    const width = this.cardBody.nativeElement.offsetWidth - 50;
    this.whiteboardComp.setSize(width);
    this.wbIsSaved=true;
    console.log("to true 3");
  }
  editName() {
    this.Wboardnamediting = true;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.Wboardnameinput.nativeElement.focus();
    }, 0);
  }
  editWboard(ind: number) {
    const Notlength = this.chosenClass.data.whiteboards.length;
    console.log("edit whiteboard", this.chosenClass.data.whiteboards[Notlength - 1 - ind]);
    
    this.form = {
      name: this.chosenClass.data.whiteboards[Notlength - 1 - ind].name,
      pages: this.addSecSvgToPages(this.chosenClass.data.whiteboards[Notlength - 1 - ind].pages),//2023-03-22T00:31
      pagesCount: this.chosenClass.data.whiteboards[Notlength - 1 - ind].pagesCount
    }
    // this.form.pages.forEach((page:any) => {
    //   page.svg=this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG())
    // });
    // console.log("this.chosenClass.data.whiteboards[ind]", this.chosenClass.data.whiteboards[Notlength-1-ind]);
    this.WboardIdToedit = this.chosenClass.data.whiteboards[Notlength - 1 - ind].id;
    // this.formInvalid = -1;
    // this.formInvalidmsg = '';
    this.openWhitboard(false);
    this.currentPage = 0;
    this.chooseSlide(0);
    // this.toggleDD(this.openedDD);
  }
  saveBoard(){
    console.log("save changes");
    let WboardTosend: any = { name:this.form.name,pages:this.onlySvgFromPages(this.form.pages),pagesCount:this.form.pagesCount ,id:this.WboardIdToedit}; 
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
    this.form = { name: '', pages: [], pagesCount: 0 };
  }
  backToList() {
    //this.form={user:false,teacher:false,moderator:false,admin:false}
    this.clean();
    this.editing = false;
    this.WboardIdToedit=-1;
    console.log("backToList");
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.Wboardnamediting) {
      if (!this.WboardnameinputBox?.nativeElement.contains(event.target)) {
        this.Wboardnamediting = false;
      }
    }

  }
  @HostListener('window:resize', ['$event'])
  resizeCanvase(event: any) {
    if (this.editing) {

      // this.whiteboardComp.setSize(width,height);
      setTimeout(() => {
        const width = this.cardBody.nativeElement.offsetWidth - 50;
        this.whiteboardComp.setSize(width);
      }, 500);

    }
  }

  // ----------------------------- slider ----------------------------- //
  nextslide() {
    this.swiperEl.nativeElement.swiper.slideNext();
  }
  prevtslide() {
    this.swiperEl.nativeElement.swiper.slidePrev();
  }
  newSlide() {
    console.log("newSlide");
    this.blockmodif=true;
    this.whiteboardComp.clearCanvas();
    this.blockmodif=false;
    this.form.pages.splice(++this.currentPage, 0, {test:this.currentPage+1, json: this.whiteboardComp.canvas.toJSON(),svg:this.whiteboardComp.canvas.toSVG(), secSvg: this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG()) });
    this.form.pagesCount++;
    this.wbIsSaved=false;
    console.log("to false 2");
    setTimeout(() => {
      console.log("swiper.activeIndex = ", this.swiperEl.nativeElement.swiper.activeIndex);

      this.swiperEl.nativeElement.swiper.update();
      // this.swiperEl.nativeElement.swiper.slideNext();
    }, 10);

  }
  copySlide() {
    if (this.currentPage > -1) {
      this.copiedPage = { ...this.form.pages[this.currentPage] };
      this.iscopying = 1;
    }

  }
  pasteSlide() {
    if (this.iscopying) {
      this.form.pages.splice(++this.currentPage, 0, this.copiedPage);
      this.form.pagesCount++;
      setTimeout(() => {
        // console.log("swiper.activeIndex = ",this.swiperEl.nativeElement.swiper.activeIndex);
        this.swiperEl.nativeElement.swiper.update();
        // this.swiperEl.nativeElement.swiper.slideNext();
      }, 10);

    }
  }
  cutSlide() {
    if (this.currentPage > -1) {
      this.copiedPage = { ...this.form.pages[this.currentPage] };
      this.iscopying = 2;
      this.deleteSlide()
    }
    console.log("cutSlide");
  }
  deleteSlide() {
    console.log("deleteSlide");
    if (this.currentPage > -1) {
      this.form.pages.splice(this.currentPage, 1);
      this.form.pagesCount--;
      if(this.currentPage==this.form.pages.length)this.currentPage--;
      setTimeout(() => {
        // console.log("swiper.activeIndex = ",this.swiperEl.nativeElement.swiper.activeIndex);
        this.swiperEl.nativeElement.swiper.update();
        // this.swiperEl.nativeElement.swiper.slideNext();
      }, 10);
    }
  }
  loadcanvas(ind: number) {
    this.whiteboardComp.canvas.loadFromJSON(this.form.pages[ind].json)
    this.whiteboardComp.updateMode();
  }
  saveSlide(ind:number){
    console.log("saveSlide ind ",ind);
    console.log("saveSlide ",this.form.pages[ind]);
    if(ind==-1)ind=this.currentPage;
    if(this.form.pages[ind]){
      this.form.pages[ind].svg=this.whiteboardComp.canvas.toSVG();
      this.form.pages[ind].secSvg=this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG());
      this.form.pages[ind].json=this.whiteboardComp.canvas.toJSON();
      if(!this.blockSaveOnOpen) this.wbIsSaved=false;
      else this.blockSaveOnOpen=false ;
      console.log("to false 1");
      
    }

  }
  onWboardChange(){
    if(!this.blockmodif)this.saveSlide(-1);
  }
  onlySvgFromPages(Pages:any):any{
    return Pages.map((elem:any)=>{return {json:elem.json,svg:elem.svg}});
  }
  addSecSvgToPages(Pages:any):any{
    return Pages.map((elem:any)=>{return {json:elem.json,svg:elem.svg,secSvg:this.sanitizer.bypassSecurityTrustHtml(elem.svg)}});
  }
}