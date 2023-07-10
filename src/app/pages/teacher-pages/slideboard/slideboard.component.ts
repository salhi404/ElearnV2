import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { WhiteboardComponent } from 'app/pages/whiteboard/whiteboard.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-slideboard',
  templateUrl: './slideboard.component.html',
  styleUrls: ['./slideboard.component.scss']
})
export class SlideboardComponent {
  @ViewChild("swiperEl") swiperEl!: ElementRef;
  @ViewChild("whiteboardComp") whiteboardComp!: WhiteboardComponent;
  currentPage: number = -1;
  blockmodif: boolean = false;
  blockSaveOnOpen: boolean = false;
  wbIsSaved: boolean = true;
  copiedPage: any = null;
  iscopying = 0;
  form: any = {
    name: '',
    pages: [],
    pagesCount: 0,
  }
  constructor(public sanitizer: DomSanitizer) { }
  chooseSlide(ind: number) {
    this.currentPage = ind;
    this.loadcanvas(ind);
  }
  // ----------------------------- slider ----------------------------- //
  nextslide() {
    this.swiperEl.nativeElement.swiper.slideNext();
  }
  prevtslide() {
    this.swiperEl.nativeElement.swiper.slidePrev();
  }
  newSlide() {
    // console.log("newSlide");
    this.blockmodif = true;
    this.whiteboardComp.clearCanvas();
    this.blockmodif = false;
    this.form.pages.splice(++this.currentPage, 0, { test: this.currentPage + 1, json: this.whiteboardComp.canvas.toJSON(), svg: this.whiteboardComp.canvas.toSVG(), secSvg: this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG()) });
    this.form.pagesCount++;
    this.wbIsSaved = false;
    // console.log('wbIsSaved to false 2');
    setTimeout(() => {
      // console.log("swiper.activeIndex = ", this.swiperEl.nativeElement.swiper.activeIndex);

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
    // console.log("cutSlide");
  }
  deleteSlide() {
    // console.log("deleteSlide");
    if (this.currentPage > -1) {
      this.form.pages.splice(this.currentPage, 1);
      this.form.pagesCount--;
      if (this.currentPage == this.form.pages.length) this.currentPage--;
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
  onWboardChange() {
    if (!this.blockmodif) this.saveSlide(-1);
  }
  saveSlide(ind: number) {
    // console.log("saveSlide ind ",ind);
    // console.log("saveSlide ",this.form.pages[ind]);
    if (ind == -1) ind = this.currentPage;
    if (this.form.pages[ind]) {
      this.form.pages[ind].svg = this.whiteboardComp.canvas.toSVG();
      this.form.pages[ind].secSvg = this.sanitizer.bypassSecurityTrustHtml(this.whiteboardComp.canvas.toSVG());
      this.form.pages[ind].json = this.whiteboardComp.canvas.toJSON();
      if (!this.blockSaveOnOpen) {
        this.wbIsSaved = false;
        // console.log('wbIsSaved to false 1');
      }
      else this.blockSaveOnOpen = false;
      // console.log("to false 1");

    }

  }
}
