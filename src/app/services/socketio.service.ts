import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket:any;
  public recievedMsgEvent = new BehaviorSubject({code:-1,data:{ email:'', username:'',date:new Date(),message:'',profileImage:''}});
  recieveMsg = this.recievedMsgEvent.asObservable();
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

sendMessage(message:string, roomName:string) {
  //console.log("send : "+message+" to room : "+roomName);
  this.socket.emit('message', { message, roomName });
}
sendMsg(msg:string){
  console.log("my message is sent " +msg);
  this.socket.emit('messages', msg);
}
}

