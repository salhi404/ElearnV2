import { Component, OnInit,OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chat } from 'src/app/Interfaces/chat';
import { DatePipe } from '@angular/common';
import { User, UserPublic } from 'src/app/Interfaces/user';
import { StorageService } from 'src/app/_services/storage.service';
import {  Router, NavigationExtras } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';

interface ChatInfo{
  chatter:UserPublic;
  chat:Chat[];
  chatroom:string;
  loaded:boolean;
}
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit,OnDestroy {
  @ViewChild('target')
  private myScrollContainer!: ElementRef;
  chats:Chat[]=[];
  timeout1:any;
  timeout2:any;
  user:User=null as any;
  chatters:UserPublic[]=[];
  chattersinfo:ChatInfo[]=[];
  tempind:number=0;
  subscription: Subscription = new Subscription;
  navigationExtras: NavigationExtras = { state: null as any };
  emailAdd:string='';
  MsgTosend:string='';
  alerthidden=true;
  alertDismissed=true;
  alertType='alert-danger';
  emailAddErrors:number=0;
  emailAddErrorString:string='';
  emailAddErrormsg:string='';
  sendMessageErrors:number=0;
  activeChat:number=-1;
  isLoggedIn:boolean=false;
  activeChatter:ChatInfo=null as any;
  constructor(private storageService: StorageService,private router: Router, private socketService:SocketioService,private authService: AuthService,) { }
  datepipe: DatePipe = new DatePipe('en-US');

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user=this.storageService.getUser();
      this.subscription=this.socketService.recieveMsg.subscribe(data=>{
        if(data.code==1){
          console.log(data.data);
          const chat:Chat={msg:data.data.message,date:data.data.date,isSent:false}
          var from =this.chattersinfo.find(e=>e.chatter.email==data.data.email);
          if (typeof from !== 'undefined'){
            from.chat.push(chat);
          }else{
            this.chatters.push({username:data.data.username,email:data.data.email,OnlineStat:-1});
            this.chattersinfo.push({chatter:this.chatters[this.chatters.length-1],chat:[chat],chatroom:this.chatters[this.chatters.length-1].email,loaded:true})
            this.storageService.saveChatters(this.chatters);
          }
          console.log("from");
          console.log(from);
          
        }
      })
    }else{
      this.navigationExtras={ state: {errorNbr:403}  };
      this.router.navigate(['/error'],this.navigationExtras);
    }
    this.chatters=this.storageService.getChatters();
    if (this.isLoggedIn) {
      this.chatters=this.chatters.filter(chatter=>chatter.email!=this.user.email)
      this.chatters.unshift({username:this.user.username+'(you)',email:this.user.email,OnlineStat:-1});
    }
    for (let index = 0; index < 10; index++) {
      this.chats.push({msg:'message '+index,date:new Date(),isSent:index%3==0})
    }
    for (let index = 0; index < this.chatters.length; index++) {
      const element = this.chatters[index];
      this.chattersinfo.push({chatter:element,chat:[...this.chats],chatroom:element.email,loaded:false})
    }
    if(this.chatters.length>0){
      this.openChat(0,this.chattersinfo[0]);
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  dismissAlert(fade:boolean){
    clearInterval(this.timeout1);
    clearInterval(this.timeout2);
    this.alerthidden=true;
    if(fade){
      setTimeout(() => {
        this.alertDismissed=true;
      }, 300);
    }else{
      this.alertDismissed=true;
    } 
  }
  getchat(from:string){

  }
  sendChat(errors:any){
    //console.log(errors);
    if(errors){
      if (typeof errors.required !== 'undefined'){
        this.sendMessageErrors=1;
        console.log("Message is required");
      }
    }else{
      const message=this.MsgTosend
      this.activeChatter.chat.push({msg:this.MsgTosend,date:new Date(),isSent:true});
      this.socketService.sendMessage(message,this.activeChatter.chatroom);
      //this.socketService.sendMsg("sms : "+message );
      this.MsgTosend='';
    }
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
    
  }
  scrollToBottom(){
    this.myScrollContainer.nativeElement.scroll({
      top: this.myScrollContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
  addchatter(errors:any){
    console.log(errors);
    if(errors){
      if (typeof errors.required !== 'undefined'){
        this.emailAddErrors=1;
        this.emailAddErrormsg="Email is required";
        console.log("Email is required");
      }else{
        if(typeof errors.email !== 'undefined'){
          this.emailAddErrors=2;
          console.log("Email must be a valid email address");
          this.emailAddErrormsg="email not valid";
        }
      }
      this.emailAddErrorString=this.emailAdd;
      this.dismissAlert(false);
      this.showAlert(true);
    }else{
    if (this.chatters.filter(chatter=>chatter.email==this.emailAdd).length == 0){
      this.authService.verifyMail(this.emailAdd).subscribe({
        next: data => {
          console.log('recieved data mail : ');
          console.log(data);
          
            this.chatters.push({username:data.username,email:data.email,OnlineStat:-1});
            this.chattersinfo.push({chatter:this.chatters[this.chatters.length-1],chat:[],chatroom:this.chatters[this.chatters.length-1].email,loaded:true})
            this.storageService.saveChatters(this.chatters);
          
        },
        error: err => {
          this.emailAddErrorString=this.emailAdd;
          if(err.status==460){
            this.emailAddErrors=3;
            console.log(this.emailAddErrormsg="email not registered");
            this.dismissAlert(false);
            this.showAlert(true);
          } 
        }
      });
    }else{
      this.emailAddErrors=4;
      this.emailAddErrormsg="user already exists";
      this.dismissAlert(false);
      this.showAlert(false);
    }
    }
  }
  showAlert(isDanger:boolean){
    this.alertType=isDanger?'alert-danger':'alert-info';
    this.alerthidden=false;
    this.alertDismissed=false;
    this.timeout1=setTimeout(() => {
      console.log("timeout1 fired ");
      this.alerthidden=true;
    }, 3500);
    this.timeout2=setTimeout(() => {
      console.log("timeout2 fired ");
      
      this.alertDismissed=true;
    }, 4000);
  }
  openChat(ind:number,chatter:ChatInfo){
    this.activeChat=ind;
    this.activeChatter=chatter
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

}
