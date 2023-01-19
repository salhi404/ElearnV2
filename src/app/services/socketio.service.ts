import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket:any;
  constructor() { }
  setupSocketConnection(token:string) {
    this.socket = io(environment.SOCKET_ENDPOINT, {
      auth: {
        token
      }
    });
    
  }
  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
}
sendMsg(msg:string){
  this.socket.emit('my message', msg);
}
}

