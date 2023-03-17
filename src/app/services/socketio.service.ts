import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket:any;
  public recievedMsgEvent = new BehaviorSubject({code:-1,data:{ email:'', username:'',date:new Date(),message:'',profileImage:''}});
  recieveMsg = this.recievedMsgEvent.asObservable();
  public recievedTaskEvent = new BehaviorSubject({code:-1,data:null as any});
  recieveTask = this.recievedTaskEvent.asObservable();
  public recievedNotifEvent = new BehaviorSubject({code:-1,data:null as any});
  recieveNotif = this.recievedNotifEvent.asObservable();
  constructor() { }
  changerecievedMsg(state: number,chat:any) {
    this.recievedMsgEvent.next({code:state,data:chat})
  }
  setupSocketConnection(token:string) {
    this.socket = io(environment.SOCKET_ENDPOINTLOCAL, {
      auth: {
        token
      }
    });
    console.log("listening");
    this.socket.on("connect", () => {console.log("connected to socket");
     });
    
    
    this.socket.on("connect_error", (err:any) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }
  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
}
getMsg(){
  if (this.socket){
    this.socket.on('message', (chat:any) => {
      this.changerecievedMsg(1,chat);
    });
  }

}
// AcceptedIn_Class_Notif
// classes_Class_Notif

getNotifications(){
  if (this.socket){
    this.socket.on('AcceptedIn_Class_Notif', (notif:any) => {
      console.log("AcceptedIn_Class notification recieved : ",notif);
      this.recievedNotifEvent.next({code:1,data:notif});
    });
  }
}
getclassTask(){
  if (this.socket){
    this.socket.on('Notif_Sent_Task', (task:any) => {
      console.log("Notif_Sent_Task recieved : ",task);
      this.recievedTaskEvent.next({code:1,data:task});
    });
  }
}
sendMessage(message:string, roomName:string) {
  //console.log("send : "+message+" to room : "+roomName);
  this.socket.emit('message', { message, roomName });
}
sendMsg(msg:string){
  console.log("my message is sent " +msg);
  this.socket.emit('messages', msg);
}
}

