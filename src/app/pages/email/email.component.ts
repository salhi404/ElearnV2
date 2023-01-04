import { Component, OnInit } from '@angular/core';
import { Mail } from 'src/app/Interfaces/Mail';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { DatePipe } from '@angular/common';
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
  filteredMail:Mail[]=[];
  recievedMail:Mail[]=[];
  InboxdMail:Mail[]=[];
  SentMail:Mail[]=[];
  MarkedMail:Mail[]=[];
  DraftMail:Mail[]=[];
  TrashMail:Mail[]=[];
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
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.getMail();
    }else{
      this.navigationExtras={ state: {errorNbr:403}  };
      this.router.navigate(['/error'],this.navigationExtras);
    }
  }
  chooseFilter(filter:number):void{
    this.openComposer=false;
    this.slectedFilter=filter;
    switch (filter) {
      case 1:
        this.filteredMail=this.InboxdMail;
        break;
      case 2:
        this.filteredMail=this.SentMail;
        break;
      case 3:
        this.filteredMail=this.MarkedMail;
        break;
      case 4:
        this.filteredMail=this.DraftMail;
        break;
      case 5:
      this.filteredMail=this.SentMail;
      break;
      case 6:
      this.filteredMail=this.TrashMail;
      break;
      default:
      this.filteredMail=[];
      break;
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
  ToggleStar(ind:number){
    console.log("ToggleStar message number "+ind);
  }
}
