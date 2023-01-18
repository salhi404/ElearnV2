import { Component, OnInit } from '@angular/core';
import { Chat } from 'src/app/Interfaces/chat';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chats:Chat[]=[];
  constructor() { }
  datepipe: DatePipe = new DatePipe('en-US');
  ngOnInit(): void {
    for (let index = 0; index < 5; index++) {
      this.chats.push({msg:'message '+index,date:new Date(),isSent:true})
    }
  }

}
