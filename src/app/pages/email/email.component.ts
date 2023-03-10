import { Component, OnInit,OnDestroy, HostListener } from '@angular/core';
import { Mail } from 'app/Interfaces/Mail';
import { AuthService } from 'app/_services/auth.service';
import { StorageService } from 'app/_services/storage.service';
import { DatePipe } from '@angular/common';
import { EventsService } from 'app/services/events.service';
import {  Router, NavigationExtras } from '@angular/router';
import { User } from 'app/Interfaces/user';
import { Subscription } from 'rxjs';

  interface  Mod{
  mail:string
  modType:number
}
interface  PublicUser
{
  username:string;
  email:string;
}
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit,OnDestroy {
  labels:any[]=[{name:"Family",color:'col-red',bgColor:"badge-danger"},{name:"Work",color:'col-blue',bgColor:"badge-primary"},{name:"Shop",color:'col-orange',bgColor:"badge-orange"}
,{name:"Themeforest",color:'col-cyan',bgColor:"badge-cyan"},{name:"Google",color:'col-blue-grey',bgColor:"badge-blue-grey"}];
  user:User=null as any;
  markedAsOppen:Mail=null as any;
  reciepients:PublicUser[]=[];
  nmbrOfShowingMsgs:number=0;
  chosenLabel:number=-1;
  replacedBody:string[]=[];
  localSynced=false;
  navigationExtras: NavigationExtras = { state: null as any };
  state: { openMail: boolean,  mail: Mail} = {openMail:false,mail:null as any};
  slectedFilter:number=1
  openedWindow:number=1;
  openedMail:Mail=null as any;
  isSentError:boolean=false;
  isSentErrorMsg:string="";
  selectAll=false;
  numberOfItems:number=20;
  selected:boolean[]=[];
  modifiedMail:Mod[]=[];
  filteredMail:Mail[]=[];
  recievedMail:Mail[]=[];
  InboxdMail:Mail[]=[];
  SentMail:Mail[]=[];
  DraftMail:Mail[]=[];
  BinMail:Mail[]=[];
  StarredMail:Mail[]=[];
  isLoggedIn = false;
  loading:boolean=false;
  sending:boolean=false;
  MsgSentSeccesfull:boolean=false;
  ShowSeccesfull:boolean=false;
  datepipe: DatePipe = new DatePipe('en-US');
  form: any = {
    email: null,
    subject: null,
    body:null,
    label:-1,
  };
  subscription: Subscription = new Subscription;
  subscription1: Subscription = new Subscription;
  subscription2: Subscription = new Subscription;
  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private events:EventsService,
  ) { 
    const navigation = this.router.getCurrentNavigation();
    this.state = { openMail: false, mail: null as any };
    if (navigation) {
      if (navigation.extras.state) {
        this.state = navigation.extras.state as {
          openMail: boolean,
          mail: Mail
        };
      }
    }

  }
  ngOnInit(): void {
    if(this.state.openMail){
      this.openWindow(3);
      this.openedMail=this.state.mail;
      this.markedAsOppen=this.openedMail;
      this.replacedBody=this.openedMail.body.split(/(\r\n|\r|\n)/g);
      this.replacedBody.forEach;
    }
    this.subscription1=this.events.taskEvent.subscribe(state=>{
      if(state.task==this.events.TASKOPENMAIL){
        this.openWindow(3);
        this.openedMail=state.data.mail;
        this.markedAsOppen=this.openedMail;
        if(this.markedAsOppen)this.markAsOppen(this.recievedMail.find(e=>e.id==this.markedAsOppen.id))
        this.replacedBody=this.openedMail.body.split(/(\r\n|\r|\n)/g);
        this.replacedBody.forEach;
      }

    })
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      //this.user=this.storageService.getUser() ;
      this.subscription2=this.events.userdataEvent.subscribe(
        state=>{
          if(state.state==this.events.UPDATEUSER){
            this.user=state.userdata;
          }
          if(state.state==this.events.DALETEUSER){
            this.user=null as any;
          }
        }
      )
      this.getMail();
      
     /* this.subscription=this.events.updatestatusEvent.subscribe(state=>{
        //console.log("state"+state);
        if(state!=-1)this.refresh();
        
      });*/
      
    }else{
      
      this.navigationExtras={ state: {errorNbr:403}  };
      this.router.navigate(['/error'],this.navigationExtras);
    }
    for (let index = 0; index < this.numberOfItems; index++) {
      this.selected.push(false);
    }
    //this.storageService.clearModMail()
    const tempMod=this.storageService.getModMail();
    if(tempMod)this.modifiedMail=tempMod;
  }
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    //this.sync();
  }
  toggleSelectAll(event:any){
      this.selectAll=event;
      for (let index = 0; index < this.numberOfItems; index++) {
        this.selected[index]=event;
      }
  }
  toggleLabel(index:number){
    if(this.chosenLabel==index){
      this.chosenLabel=-1;
      this.nmbrOfShowingMsgs=this.filteredMail.length;
    }else{
      this.chosenLabel=index;
      this.nmbrOfShowingMsgs=this.filteredMail.filter(e=>e.label==index).length;
      
    } 
  }
  ToggleStar(id:string,fosync:boolean){
    this.recievedMail.forEach((element,ind)=>{
      if(element.id===id){
        if(element.tags.includes("starred")){
          element.tags = element.tags.filter(e => e !== 'starred');
          this.StarredMail=this.StarredMail.filter(e=>e.id!=id);
        }
        else {
          element.tags.push("starred");
          this.StarredMail.push(element);
        }
        if(!fosync)this.toggleModMailArrey(element,1);
        //if(!this.modifiedMail.includes({mail:element,modType:1}))this.modifiedMail.push({mail:element,modType:1});
        
      }
    })
    
  }
  starSelected(){
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        const elem=this.filteredMail[this.filteredMail.length-index-1];
          if(!elem.tags.includes("starred")){
            elem.tags.push("starred");
            this.StarredMail.push(elem);
            this.toggleModMailArrey(elem,1);
          }
      }
    }
    this.toggleSelectAll(false);
  }
  deStarSelected(){
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        const elem=this.filteredMail[this.filteredMail.length-index-1];
          if(elem.tags.includes("starred")){
            elem.tags=elem.tags.filter(e=>e !="starred");
            this.StarredMail=this.StarredMail.filter(e=>e.id !=elem.id);
            this.toggleModMailArrey(elem,1);
          }
          
      }
    }
    this.toggleSelectAll(false);
  }
  toggleModMailArrey(elem:Mail,type:number){
    if (this.modifiedMail.filter(e=>(e.mail==elem.id)&&(e.modType==type)).length > 0)
    this.modifiedMail=this.modifiedMail.filter(e=>!((e.mail==elem.id)&&(e.modType==type)));
    else this.modifiedMail.push({mail:elem.id,modType:type});
    this.storageService.saveModMail(this.modifiedMail);
  }
  deleteSelected(){
      for (let index = 0; index < this.filteredMail.length; index++) {
        if(this.selected[index]){
          const elem=this.filteredMail[this.filteredMail.length-index-1];
            if(!elem.tags.includes("bin")){
              elem.tags.push("bin");
              this.BinMail.push(elem);
              this.InboxdMail=this.InboxdMail.filter(e=>e.id !=elem.id);
              this.SentMail=this.SentMail.filter(e=>e.id !=elem.id);
              this.StarredMail=this.StarredMail.filter(e=>e.id !=elem.id);
            }
            this.toggleModMailArrey(elem,2);
        }
    }
    this.refilter(this.slectedFilter);
    this.toggleSelectAll(false);
  }
  foreverDeleteSelected(){
    var mails: string[]=[];
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        const elem=this.filteredMail[this.filteredMail.length-index-1];
        mails.push(elem.id);
        this.deleteItem(elem,1);
        this.modifiedMail=this.modifiedMail.filter(element=>element.mail!=elem.id)
      }
    }
    this.storageService.saveModMail(this.modifiedMail);
    this.refilter(this.slectedFilter);
    this.toggleSelectAll(false);
    this.authService.deleteMail(mails).subscribe({
      next: data => {
        // console.log("deleteMail ",data);
      },
      error: err => {
        console.log(err.error.message);
      }
    });
  }
  private deleteItem(elem:Mail,from:number){
    this.recievedMail=this.recievedMail.filter(elm=>elm.id!=elem.id);
    if(from==1)this.BinMail=this.BinMail.filter(elm=>elm.id!=elem.id);
  }
  undeleteSelected(){
    for (let index = 0; index < this.filteredMail.length; index++) {
      if(this.selected[index]){
        const elem=this.filteredMail[this.filteredMail.length-index-1];
          if(elem.tags.includes("bin")){
            elem.tags=elem.tags.filter(e=>e!="bin");
          }
          this.toggleModMailArrey(elem,2);
      }
  }
  this.resectionMail();
  this.refilter(this.slectedFilter);
  this.toggleSelectAll(false);
  }
  toggleDelete(id:string){
    this.recievedMail.forEach((element,ind)=>{
      if(element.id===id){
        if(element.tags.includes("bin")) element.tags = element.tags.filter(e => e !== 'bin');
        else element.tags.push("bin"); 
      }
    })
  }
  toggleOppened(id:string){
    this.recievedMail.forEach((element,ind)=>{
      if(element.id===id){
        if(!element.tags.includes("oppened")) element.tags.push("oppened"); 
      }
    })
  }
  private synclocal(){
    this.modifiedMail.forEach(element => {
      if(element.modType==1){
        this.ToggleStar(element.mail,true);
      }
      if(element.modType==2){
        this.toggleDelete(element.mail);
      }
      if(element.modType==3){
        this.toggleOppened(element.mail);
      }
    });
  }
  public sync(){
    var mailtags: any[]=[];
    var elem;
    this.modifiedMail.forEach(element => {
      elem=this.recievedMail.find(el=>el.id==element.mail);
      if(elem) mailtags.push({mailId:element.mail,tag:elem.tags});
    });
    this.authService.syncMailTags(mailtags).subscribe({
      next: data => {;
      },
      error: err => {
        console.log(err.error.message);
        console.log("synced err");
      }
    });
    this.modifiedMail=[];
    this.storageService.clearModMail();
  }
  chooseFilter(filter:number,window:number):void{
    this.openWindow(window);
    this.slectedFilter=filter;
    this.toggleSelectAll(false);
    this.selectAll=false;
    this.refilter(filter);
  }
  refilter(filter:number){
    switch (filter) {
      case 1:
        this.filteredMail=this.InboxdMail;
        this.nmbrOfShowingMsgs=this.InboxdMail.length;
        break;
      case 2:
        this.filteredMail=this.SentMail;
        this.nmbrOfShowingMsgs=this.SentMail.length;
        break;
      case 3:
        this.filteredMail=this.DraftMail;
        this.nmbrOfShowingMsgs=this.DraftMail.length;
        break;
      case 4:
        this.filteredMail=this.BinMail;
        this.nmbrOfShowingMsgs=this.BinMail.length;
        break;
      case 5:
      this.filteredMail=this.StarredMail;
      this.nmbrOfShowingMsgs=this.StarredMail.length;
      break;
      /*default:
      this.filteredMail=[];
      break;*/
    }
  }
  refresh(){
    // TODO - refresh with soket event
    this.getMail();
  }
  openWindow(wnd:number):void{
    this.openedWindow=wnd;
    if(wnd==2) this.slectedFilter=-this.slectedFilter;
    this.chosenLabel=-1;
  }
  backfromCompose(){
    this.slectedFilter=-this.slectedFilter;
    this.openWindow(1);
  }
  /*
  sendMail(){
    const mail:Mail={
      id:this.storageService.getId(),
      isSent:true,
      fromTo:{username:"reciever",email:"reciever@mail.com"},
      date:new Date(),
      subject:"test subject ",
      body:"Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem\
      Page When Looking At Its Layout Looking At Its Layout The Point Of Using Lorem.",
      tags:["Inbox","Sent","Marked","Draft","Sent","trash"],
      label:-1
    }
    
    this.authService.sendMail(mail,1).subscribe({
      next: data => {
        console.log(data);
        
      },
      error: err => {
        console.log(err.error.message);
        
      }
    });
  }*/
   recieveMail():void{
    this.loading=true;
    this.authService.getMail().subscribe({
      next: mails => {
        this.recievedMail=[]; 
        mails.forEach((element:any, index:number) => {
          const mm={
            id:element._id,
            isSent:element.isSent,
            fromTo:{username:element.fromToUserName,email:element.fromToMail},
            date:element.date,
            subject:element.subject,
            body:element.body,
            tags:element.tags,
            label:element.label||-1,
          }
          this.recievedMail.push(mm);
        });
        this.synclocal();
        this.sync();
        this.resectionMail();
        this.chooseFilter(this.slectedFilter,this.openedWindow);
        if(this.markedAsOppen)this.markAsOppen(this.recievedMail.find(e=>e.id==this.markedAsOppen.id))
        this.loading=false;
      },
      
      error: err => {
        this.loading=false;
        console.log(err.error.message);
      }
    });
  }
  markAsOppen(mail:Mail|undefined)
  {
    if(typeof(mail)!="undefined"){
      if(!mail.tags.includes("oppened")){
        mail.tags.push("oppened");
        this.modifiedMail.push({mail:mail.id,modType:3});
        this.storageService.saveModMail(this.modifiedMail);
        this.sync();//tempppp
        this.markedAsOppen=null as any;
      }
    }
    
  }
  resectionMail(){
    this.SentMail=[];
    this.InboxdMail=[];
    this.StarredMail=[];
    this.BinMail=[];
    this.DraftMail=[];
    this.recievedMail.forEach(element => {
      if(element.tags.includes("sent")&&!element.tags.includes("bin"))this.SentMail.push(element);
      if(element.tags.includes("inbox")&&!element.tags.includes("bin"))this.InboxdMail.push(element);
      if(element.tags.includes("starred")&&!element.tags.includes("bin"))this.StarredMail.push(element);
      if(element.tags.includes("bin"))this.BinMail.push(element);
      if(this.reciepients.filter(e=>e.email==element.fromTo.email).length==0)this.reciepients.push(element.fromTo as PublicUser); 
    });
  }
  getMail():Mail[]{
    // FIXME - sort mail by new
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
      tags:["Sent"],
      label:this.form.label
    }
    this.sending=true;
    this.authService.sendMail(mail,1).subscribe({
      next: data => {
        this.sending=false;
        this.ShowSeccesfull=true;
        this.MsgSentSeccesfull=true;
        setTimeout(() => {
          this.ShowSeccesfull=false;
        }, 1800);
      },
      error: err => {
        this.isSentError=true;
        this.sending=false;
        this.isSentErrorMsg=err.error.message;
        console.log(err.error.message);
        this.ShowSeccesfull=true;
        this.MsgSentSeccesfull=false;
        setTimeout(() => {
          this.ShowSeccesfull=false;
        }, 1800);
      }
      
    });
  }
  openMsg(ind:number){
    this.openWindow(3);
    this.openedMail=this.filteredMail[this.filteredMail.length-ind-1];
    this.markAsOppen(this.openedMail);
    this.replacedBody=this.openedMail.body.split(/(\r\n|\r|\n)/g);
    this.replacedBody.forEach
  }
  reply(){
    this.form.email=this.openedMail.fromTo.email;
    this.form.subject=this.openedMail.subject;
    this.openWindow(2);
  }
  forward(){
    this.form.body=this.openedMail.body;
    this.form.subject=this.openedMail.subject;
    this.openWindow(2);
  }
  snedTo(email:string){
    this.form.email=email;
    this.openWindow(2);
  }
  discard(){
    this.form = {
      email: null,
      subject: null,
      body:null,
      label:-1,
    };
    this.chooseFilter(1,1);
  }
  
}
