import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chat } from 'src/app/Interfaces/chat';
import { DatePipe } from '@angular/common';
import { User, UserPublic } from 'src/app/Interfaces/user';
import { StorageService } from 'src/app/_services/storage.service';
import {  Router, NavigationExtras } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';

interface ChatInfo{
  chatter:UserPublic;
  chat:Chat[];
}
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('target')
  private myScrollContainer!: ElementRef;
  chats:Chat[]=[];
  user:User=null as any;
  chatters:UserPublic[]=[];
  chattersinfo:ChatInfo[]=[];
  tempind:number=0;
  navigationExtras: NavigationExtras = { state: null as any };
  emailAdd:string='';
  MsgTosend:string=''
  emailAddErrors:number=0;
  activeChat:number=-1;
  isLoggedIn:boolean=false;
  activeChatter:ChatInfo=null as any;
  constructor(private storageService: StorageService,private router: Router, private socketService:SocketioService,) { }
  datepipe: DatePipe = new DatePipe('en-US');

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      console.log("dsfsdfsdfffffffffffff");
      
      this.user=this.storageService.getUser();
    }else{
      this.navigationExtras={ state: {errorNbr:403}  };
      this.router.navigate(['/error'],this.navigationExtras);
    }
    this.chatters=this.storageService.getChatters();
    if (this.isLoggedIn) {
      this.chatters.unshift({username:this.user.username+'(you)',email:this.user.email,OnlineStat:-1});
    }
    for (let index = 0; index < 10; index++) {
      this.chats.push({msg:'message '+index,date:new Date(),isSent:index%3==0})
    }
    for (let index = 0; index < this.chatters.length; index++) {
      const element = this.chatters[index];
      this.chattersinfo.push({chatter:element,chat:[...this.chats]})
      
    }
    if(this.chatters.length>0){
      this.openChat(0,this.chattersinfo[0]);
    }
    
   
  }
  sendChat(errors:any){
    console.log(errors);
    if(errors){
      if (typeof errors.required !== 'undefined'){
        this.emailAddErrors=1;
        console.log("Message is required");
      }
    }else{
      this.activeChatter.chat.push({msg:this.MsgTosend,date:new Date(),isSent:true});
      this.socketService.sendMsg(this.MsgTosend);
      this.MsgTosend='';
      
    }
    console.log(this.myScrollContainer.nativeElement.scrollHeight);
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
          console.log("Email is required");
      }else{
        if(typeof errors.email !== 'undefined'){
          this.emailAddErrors=2;
          console.log("Email must be a valid email address");
        }
      }
    }else{
      if (this.chatters.filter(chatter=>chatter.email==this.emailAdd).length == 0){
        this.chatters.push({username:"user"+(this.tempind++),email:this.emailAdd,OnlineStat:(this.tempind%3==2)?(new Date().getTime()-(this.tempind+1)*60*1000):-1});
        this.storageService.saveChatters(this.chatters);
      }
    }
  }
  openChat(ind:number,chatter:ChatInfo){
    this.activeChat=ind;
    this.activeChatter=chatter
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

}
