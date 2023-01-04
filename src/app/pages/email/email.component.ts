import { Component, OnInit } from '@angular/core';
import { Mail } from 'src/app/Interfaces/Mail';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  Router, NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  navigationExtras: NavigationExtras = { state: null as any };
  slectedFilter:number=1
  openComposer:boolean=false;
  isSentError:boolean=false;
  isSentErrorMsg:string="";
  selectAll=false;
  numberOfItems:number=20;
  selected:boolean[]=[];
  modifiedMail:Mail[]=[];
  filteredMail:Mail[]=[];
  recievedMail:Mail[]=[];
  InboxdMail:Mail[]=[];
  SentMail:Mail[]=[];
  DraftMail:Mail[]=[];
  BinMail:Mail[]=[];
  StarredMail:Mail[]=[];
  isLoggedIn = false;
  datepipe: DatePipe = new DatePipe('en-US')
  form: any = {
    email: null,
    subject: null,
    body:null,
  };
  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    for (let index = 0; index < this.numberOfItems; index++) {
      this.selected.push(false);
    }
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.getMail();
    }else{
      this.navigationExtras={ state: {errorNbr:403}  };
      this.router.navigate(['/error'],this.navigationExtras);
    }
  }
  toggleSelectAll(event:any){
      for (let index = 0; index < this.filteredMail.length; index++) {
        this.selected[index]=event;
      }
  }
  starSelected(){
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        console.log("ind :"+index);
        const elem=this.filteredMail[this.filteredMail.length-index-1];
        console.log(elem); 
          if(!elem.tags.includes("starred")){
            elem.tags.push("starred");
            this.StarredMail.push(elem);
          }
          if(!this.modifiedMail.includes(elem))this.modifiedMail.push(elem);
      }
    }
  }
  deStarSelected(){
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        console.log("ind :"+index);
        const elem=this.filteredMail[this.filteredMail.length-index-1];
        console.log(elem); 
          if(elem.tags.includes("starred")){
            elem.tags=elem.tags.filter(e=>e !="starred");
            this.StarredMail=this.StarredMail.filter(e=>e.id !=elem.id);
          }
          if(!this.modifiedMail.includes(elem))this.modifiedMail.push(elem);
      }
    }
  }
  deleteSelected(){
      for (let index = 0; index < this.filteredMail.length; index++) {
        if(this.selected[index]){
          console.log("ind :"+index);
          const elem=this.filteredMail[this.filteredMail.length-index-1];
          console.log(elem); 
            if(!elem.tags.includes("bin")){
              elem.tags.push("bin");
              this.BinMail.push(elem);
              this.InboxdMail=this.InboxdMail.filter(e=>e.id !=elem.id);
              this.SentMail=this.SentMail.filter(e=>e.id !=elem.id);
              this.StarredMail=this.StarredMail.filter(e=>e.id !=elem.id);
              
            }
            if(!this.modifiedMail.includes(elem))this.modifiedMail.push(elem);
        }
    }
    this.refilter(this.slectedFilter);
    this.toggleSelectAll(false);
  }
  chooseFilter(filter:number):void{
    this.openComposer=false;
    this.slectedFilter=filter;
    this.toggleSelectAll(false);
    this.selectAll=false;
    this.refilter(filter);
  }
  refilter(filter:number){
    switch (filter) {
      case 1:
        this.filteredMail=this.InboxdMail;
        break;
      case 2:
        this.filteredMail=this.SentMail;
        break;
      case 3:
        this.filteredMail=this.DraftMail;
        break;
      case 4:
        this.filteredMail=this.BinMail;
        break;
      case 5:
      this.filteredMail=this.StarredMail;
      break;
      /*default:
      this.filteredMail=[];
      break;*/
    }
  }
  refresh(){
    this.getMail();
  }
  openComposeWindow():void{
    this.openComposer=true;
    this.slectedFilter=-1;
  }

  sendMail(){
    const mail:Mail={
      id:this.storageService.getId(),
      isSent:true,
      fromTo:{username:"reciever",email:"reciever@mail.com"},
      date:new Date(),
      subject:"test subject ",
      body:"Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem\
      Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem.",
      tags:["Inbox","Sent","Marked","Draft","Sent","trash"]
    }
    this.authService.sendMail(mail,1).subscribe({
      next: data => {
        console.log(data);
      },
      error: err => {
        console.log(err.error.message);
      }
    });
  }
   recieveMail():void{
    this.authService.getMail().subscribe({
      next: mails => {
        console.log(mails);
        this.recievedMail=[];
        this.SentMail=[];
        this.InboxdMail=[];
        this.StarredMail=[];
        this.BinMail=[];
        this.DraftMail=[];
        mails.forEach((element:any, index:number) => {
          const mm={
            id:element._id,
            isSent:element.isSent,
            fromTo:{username:element.fromToUserName,email:element.fromToMail},
            date:element.date,
            subject:element.subject,
            body:element.body,
            tags:element.tags,
          }
          this.recievedMail.push(mm);
          if(mm.tags.includes("sent"))this.SentMail.push(mm);
          if(mm.tags.includes("inbox"))this.InboxdMail.push(mm);
          if(mm.tags.includes("starred"))this.StarredMail.push(mm);
          if(mm.tags.includes("bin"))this.BinMail.push(mm);

        });
        this.chooseFilter(this.slectedFilter);
        
      },
      error: err => {
        
        console.log(err.error.message);
      }
    });
  }
  getMail():Mail[]{
    var mail:Mail[]=[];
    this.recieveMail();
    /*for (let index = 0; index < 10; index++) {
        mail.push(
          {
            id:'sdsd',
            isSent:(index%3)==1,
            fromTo:{username:"user"+(index+1),email:"user"+index+"mail.com",status:index%3},
            date:new Date(),
            subject:"test subjedt "+index%3,
            body:"Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem\
            Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem.",
            tags:["Inbox","Sent","Marked","Draft","Sent","trash"]
          }
        )
    }*/
    return mail;
  }
  onSubmit():void{
    this.isSentError=false;
    this.isSentErrorMsg="";
    const mail:Mail={
      id:this.storageService.getId(),
      isSent:true,
      fromTo:{username:"",email:this.form.email},
      date:new Date(),
      subject:this.form.subject,
      body:this.form.body,
      tags:["Sent"]
    }
    this.authService.sendMail(mail,1).subscribe({
      next: data => {
        console.log(data);
      },
      error: err => {
        this.isSentError=true;
        this.isSentErrorMsg=err.error.message;
        console.log(err.error.message);
      }
    });
  }
  openMsg(ind:number){
    console.log("open message number "+ind);
  }
  test(event:any,id:string){
    /*console.log("id");
    console.log(id);
    console.log("event");
    console.log(event);
    */
    
  }
  ToggleStar(id:string){
    console.log("ToggleStar message number "+id);
    this.recievedMail.forEach((element,ind)=>{
      
      if(element.id==id){
        if(element.tags.includes("starred")){
          element.tags = element.tags.filter(e => e !== 'starred');
          this.StarredMail=this.StarredMail.filter(e=>e.id!=id);
        }
        else {
          element.tags.push("starred");
          this.StarredMail.push(element);
        }
        if(!this.modifiedMail.includes(element))this.modifiedMail.push(element);
      }
    })
    
  }
}
